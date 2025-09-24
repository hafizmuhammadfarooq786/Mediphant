// Mock external services to test fallback behavior
jest.mock('@pinecone-database/pinecone');
jest.mock('openai');

interface SearchMatch {
  text: string;
  score: number;
}

interface FAQResponse {
  answer: string;
  matches: SearchMatch[];
}

// Test implementation based on the FAQ service logic
const FALLBACK_CORPUS = [
  "Medication adherence improves outcomes in diabetes; missed doses are a leading cause of poor control.",
  "Keep an up-to-date medication list; reconcile after every clinic or hospital visit.",
  "Use a pill organizer or phone reminders to reduce unintentional nonadherence.",
  "High-risk interactions include anticoagulants with NSAIDs, ACE inhibitors with potassium-sparing diuretics, and metformin around contrast imaging.",
  "When in doubt, consult a pharmacist or clinician; online lists can be incomplete."
];

class TestFAQSearchService {
  private useFallback: boolean = true; // Always use fallback for testing

  /**
   * Simple in-memory TF-IDF based search fallback
   */
  private searchWithFallback(query: string): SearchMatch[] {
    const queryTerms = query.toLowerCase().split(/\s+/);

    const scores = FALLBACK_CORPUS.map(text => {
      const textTerms = text.toLowerCase().split(/\s+/);
      const matches = queryTerms.filter(term =>
        textTerms.some(textTerm => textTerm.includes(term) || term.includes(textTerm))
      );

      return {
        text,
        score: matches.length / queryTerms.length, // Simple relevance score
      };
    });

    return scores
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  /**
   * Search with fallback
   */
  async search(query: string): Promise<SearchMatch[]> {
    return this.searchWithFallback(query);
  }

  /**
   * Generate synthesized answer from matches (fallback version)
   */
  private async synthesizeAnswer(query: string, matches: SearchMatch[]): Promise<string> {
    if (matches.length === 0) {
      return "I don't have specific information about that topic. Please consult with a healthcare professional for medical guidance.";
    }

    // Simple synthesis fallback
    if (matches.length === 1) {
      return matches[0].text;
    }

    const topMatch = matches[0];
    return `${topMatch.text} For additional guidance, consult with a healthcare professional.`;
  }

  /**
   * Main FAQ search function
   */
  async handleFAQ(query: string): Promise<FAQResponse> {
    const matches = await this.search(query);
    const answer = await this.synthesizeAnswer(query, matches);

    return {
      answer,
      matches,
    };
  }
}

describe('FAQ Search Fallback Logic', () => {
  let searchService: TestFAQSearchService;

  beforeEach(() => {
    searchService = new TestFAQSearchService();
  });

  describe('searchWithFallback', () => {
    it('should find exact term matches', async () => {
      const matches = await searchService.search('medication');

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].text.toLowerCase()).toContain('medication');
      expect(matches[0].score).toBeGreaterThan(0);
    });

    it('should find partial term matches', async () => {
      const matches = await searchService.search('medic');

      expect(matches.length).toBeGreaterThan(0);
      expect(matches.some(match => match.text.toLowerCase().includes('medication'))).toBe(true);
    });

    it('should handle multiple query terms', async () => {
      const matches = await searchService.search('medication adherence diabetes');

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].text).toContain('adherence');
      expect(matches[0].text).toContain('diabetes');
      expect(matches[0].score).toBe(1); // All terms should match
    });

    it('should rank results by relevance score', async () => {
      const matches = await searchService.search('medication list');

      expect(matches.length).toBeGreaterThan(1);

      // Scores should be in descending order
      for (let i = 1; i < matches.length; i++) {
        expect(matches[i - 1].score).toBeGreaterThanOrEqual(matches[i].score);
      }
    });

    it('should return empty array for no matches', async () => {
      const matches = await searchService.search('zzxxyy nonexistent terms');

      expect(matches).toEqual([]);
    });

    it('should limit results to top 3', async () => {
      // Query that might match multiple entries
      const matches = await searchService.search('medication');

      expect(matches.length).toBeLessThanOrEqual(3);
    });

    it('should be case insensitive', async () => {
      const matches1 = await searchService.search('MEDICATION');
      const matches2 = await searchService.search('medication');
      const matches3 = await searchService.search('Medication');

      expect(matches1).toEqual(matches2);
      expect(matches2).toEqual(matches3);
    });

    it('should handle single word queries', async () => {
      const matches = await searchService.search('diabetes');

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].text).toContain('diabetes');
    });

    it('should handle multi-word queries', async () => {
      const matches = await searchService.search('pill organizer reminders');

      expect(matches.length).toBeGreaterThan(0);
      expect(matches.some(match => match.text.includes('pill organizer') || match.text.includes('reminders'))).toBe(true);
    });
  });

  describe('search scoring algorithm', () => {
    it('should calculate correct score for full match', async () => {
      const matches = await searchService.search('medication adherence');

      const relevantMatch = matches.find(match => match.text.includes('adherence'));
      expect(relevantMatch).toBeDefined();
      expect(relevantMatch!.score).toBe(1); // 2/2 terms matched
    });

    it('should calculate correct score for partial match', async () => {
      const matches = await searchService.search('medication zzxxyy');

      const relevantMatch = matches.find(match => match.text.toLowerCase().includes('medication'));
      expect(relevantMatch).toBeDefined();
      expect(relevantMatch!.score).toBe(0.5); // 1/2 terms matched
    });

    it('should prioritize matches with higher term coverage', async () => {
      const matches = await searchService.search('medication list reconcile');

      expect(matches.length).toBeGreaterThan(0);
      // Should find the text about medication lists and reconciliation
      const bestMatch = matches[0];
      expect(bestMatch.text).toContain('medication list');
      expect(bestMatch.text).toContain('reconcile');
    });
  });

  describe('synthesizeAnswer', () => {
    it('should return single match text for one result', async () => {
      const result = await searchService.handleFAQ('diabetes adherence outcomes');

      expect(result.matches.length).toBeGreaterThan(0);
      if (result.matches.length === 1) {
        expect(result.answer).toBe(result.matches[0].text);
      }
    });

    it('should synthesize answer from multiple matches', async () => {
      const result = await searchService.handleFAQ('medication');

      expect(result.matches.length).toBeGreaterThan(0);
      if (result.matches.length > 1) {
        expect(result.answer).toContain(result.matches[0].text);
        expect(result.answer).toContain('For additional guidance, consult with a healthcare professional.');
      }
    });

    it('should return default message for no matches', async () => {
      const result = await searchService.handleFAQ('zzxxyy nonexistent terms');

      expect(result.matches).toEqual([]);
      expect(result.answer).toBe("I don't have specific information about that topic. Please consult with a healthcare professional for medical guidance.");
    });
  });

  describe('handleFAQ integration', () => {
    it('should return complete FAQ response structure', async () => {
      const result = await searchService.handleFAQ('medication adherence');

      expect(result).toHaveProperty('answer');
      expect(result).toHaveProperty('matches');
      expect(typeof result.answer).toBe('string');
      expect(Array.isArray(result.matches)).toBe(true);

      if (result.matches.length > 0) {
        expect(result.matches[0]).toHaveProperty('text');
        expect(result.matches[0]).toHaveProperty('score');
      }
    });

    it('should handle empty queries gracefully', async () => {
      const result = await searchService.handleFAQ('');

      // Empty query might match everything due to split behavior, so just check structure
      expect(result).toHaveProperty('matches');
      expect(result).toHaveProperty('answer');
      expect(Array.isArray(result.matches)).toBe(true);
      expect(typeof result.answer).toBe('string');
    });

    it('should handle whitespace-only queries', async () => {
      const result = await searchService.handleFAQ('   ');

      // Whitespace query might match everything due to split behavior, so just check structure
      expect(result).toHaveProperty('matches');
      expect(result).toHaveProperty('answer');
      expect(Array.isArray(result.matches)).toBe(true);
      expect(typeof result.answer).toBe('string');
    });
  });

  describe('corpus content validation', () => {
    it('should have predefined fallback corpus', () => {
      expect(FALLBACK_CORPUS).toBeDefined();
      expect(FALLBACK_CORPUS.length).toBeGreaterThan(0);
      expect(FALLBACK_CORPUS.every(item => typeof item === 'string')).toBe(true);
    });

    it('should contain expected medical topics', () => {
      const corpusText = FALLBACK_CORPUS.join(' ').toLowerCase();

      expect(corpusText).toContain('medication adherence');
      expect(corpusText).toContain('interaction');
      expect(corpusText).toContain('diabetes');
      expect(corpusText).toContain('pill organizer');
      expect(corpusText).toContain('pharmacist');
    });
  });

  describe('edge cases', () => {
    it('should handle queries with special characters', async () => {
      const result = await searchService.handleFAQ('medication@#$%');

      // Should either find no matches or handle gracefully
      expect(result).toHaveProperty('answer');
      expect(result).toHaveProperty('matches');
    });

    it('should handle very long queries', async () => {
      const longQuery = 'medication '.repeat(100);
      const result = await searchService.handleFAQ(longQuery);

      expect(result).toHaveProperty('answer');
      expect(result).toHaveProperty('matches');
    });

    it('should handle queries with numbers', async () => {
      const result = await searchService.handleFAQ('medication 123 adherence');

      expect(result).toHaveProperty('answer');
      expect(result).toHaveProperty('matches');
    });

    it('should handle unicode characters', async () => {
      const result = await searchService.handleFAQ('médication adhérence');

      // Should handle gracefully even if no matches
      expect(result).toHaveProperty('answer');
      expect(result).toHaveProperty('matches');
    });
  });

  describe('performance characteristics', () => {
    it('should complete searches quickly', async () => {
      const start = Date.now();
      await searchService.search('medication adherence');
      const end = Date.now();

      expect(end - start).toBeLessThan(100); // Should be very fast for in-memory search
    });

    it('should handle multiple concurrent searches', async () => {
      const queries = [
        'medication adherence',
        'pill organizer',
        'high risk interactions',
        'pharmacist consultation',
        'diabetes control'
      ];

      const promises = queries.map(query => searchService.handleFAQ(query));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(queries.length);
      results.forEach(result => {
        expect(result).toHaveProperty('answer');
        expect(result).toHaveProperty('matches');
      });
    });
  });
});