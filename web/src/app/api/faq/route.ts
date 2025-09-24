import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import { rateLimiter } from '@/lib/rateLimit';

interface SearchMatch {
  text: string;
  score: number;
}

interface FAQResponse {
  answer: string;
  matches: SearchMatch[];
}

// Fallback corpus for in-memory search
const FALLBACK_CORPUS = [
  "Medication adherence improves outcomes in diabetes; missed doses are a leading cause of poor control.",
  "Keep an up-to-date medication list; reconcile after every clinic or hospital visit.",
  "Use a pill organizer or phone reminders to reduce unintentional nonadherence.",
  "High-risk interactions include anticoagulants with NSAIDs, ACE inhibitors with potassium-sparing diuretics, and metformin around contrast imaging.",
  "When in doubt, consult a pharmacist or clinician; online lists can be incomplete."
];

class FAQSearchService {
  private pinecone?: Pinecone;
  private openai?: OpenAI;
  private useFallback: boolean = false;

  constructor() {
    try {
      if (process.env.PINECONE_API_KEY && process.env.OPENAI_API_KEY) {
        this.pinecone = new Pinecone({
          apiKey: process.env.PINECONE_API_KEY,
        });
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
      } else {
        console.warn('Missing API keys, falling back to in-memory search');
        this.useFallback = true;
      }
    } catch (error) {
      console.error('Failed to initialize external services, using fallback:', error);
      this.useFallback = true;
    }
  }

  /**
   * Pinecone vector similarity search
   */
  private async searchWithPinecone(query: string): Promise<SearchMatch[]> {
    if (!this.pinecone || !this.openai) {
      throw new Error('Pinecone or OpenAI not initialized');
    }

    try {
      // Generate query embedding
      const embeddingResponse = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: query,
      });

      const queryEmbedding = embeddingResponse.data[0].embedding;

      // Search Pinecone
      const index = this.pinecone.index(process.env.PINECONE_INDEX || 'mediphant-test');
      const searchResponse = await index.query({
        vector: queryEmbedding,
        topK: 3,
        includeMetadata: true,
      });

      return searchResponse.matches?.map(match => ({
        text: match.metadata?.text as string || '',
        score: match.score || 0,
      })).filter(match => match.text) || [];

    } catch (error) {
      console.error('Pinecone search failed, falling back:', error);
      throw error;
    }
  }

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
   * Search with automatic fallback
   */
  async search(query: string): Promise<SearchMatch[]> {
    if (this.useFallback) {
      return this.searchWithFallback(query);
    }

    try {
      return await this.searchWithPinecone(query);
    } catch (error) {
      console.warn('Pinecone search failed, using fallback:', error);
      this.useFallback = true;
      return this.searchWithFallback(query);
    }
  }

  /**
   * Generate synthesized answer from matches
   */
  private async synthesizeAnswer(query: string, matches: SearchMatch[]): Promise<string> {
    if (matches.length === 0) {
      return "I don't have specific information about that topic. Please consult with a healthcare professional for medical guidance.";
    }

    // If we have OpenAI, use it for synthesis
    if (this.openai && !this.useFallback) {
      try {
        const context = matches.map(m => m.text).join('\n\n');
        const prompt = `Based on the following medical information, provide a concise answer to the question: "${query}"

Context:
${context}

Please provide a helpful, accurate response. If the context doesn't contain enough information, say so and recommend consulting a healthcare professional.`;

        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200,
          temperature: 0.3,
        });

        return response.choices[0]?.message?.content || 'Unable to generate response.';
      } catch (error) {
        console.error('OpenAI synthesis failed:', error);
        // Fall through to simple synthesis
      }
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

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!rateLimiter.isAllowed(clientIp)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const searchService = new FAQSearchService();
    const result = await searchService.handleFAQ(query.trim());

    return NextResponse.json(result);

  } catch (error) {
    console.error('FAQ API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        answer: 'Sorry, I encountered an error processing your request. Please consult with a healthcare professional.',
        matches: []
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET with query parameter "q".' },
    { status: 405 }
  );
}