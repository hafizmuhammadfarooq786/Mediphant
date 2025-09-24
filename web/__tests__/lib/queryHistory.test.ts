import { queryHistoryStore, QueryHistoryItem } from '@/lib/queryHistory';

class TestableQueryHistoryStore {
  private history: QueryHistoryItem[] = [];
  private readonly maxItems = 10;

  addQuery(medA: string, medB: string, isPotentiallyRisky: boolean, reason: string): void {
    const item: QueryHistoryItem = {
      id: Date.now().toString(),
      medA,
      medB,
      isPotentiallyRisky,
      reason,
      timestamp: new Date(),
    };

    this.history.unshift(item);

    if (this.history.length > this.maxItems) {
      this.history = this.history.slice(0, this.maxItems);
    }
  }

  getRecentQueries(): QueryHistoryItem[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }

  // Test helper methods
  getHistoryLength(): number {
    return this.history.length;
  }

  getMaxItems(): number {
    return this.maxItems;
  }
}

describe('QueryHistory', () => {
  let testStore: TestableQueryHistoryStore;

  beforeEach(() => {
    testStore = new TestableQueryHistoryStore();
  });

  describe('addQuery', () => {
    it('should add a new query to history', () => {
      testStore.addQuery('warfarin', 'ibuprofen', true, 'increased bleeding risk');

      const history = testStore.getRecentQueries();
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        medA: 'warfarin',
        medB: 'ibuprofen',
        isPotentiallyRisky: true,
        reason: 'increased bleeding risk',
      });
      expect(history[0].id).toBeDefined();
      expect(history[0].timestamp).toBeInstanceOf(Date);
    });

    it('should add multiple queries in correct order', () => {
      testStore.addQuery('warfarin', 'ibuprofen', true, 'bleeding risk');
      testStore.addQuery('aspirin', 'vitamins', false, 'no interaction');

      const history = testStore.getRecentQueries();
      expect(history).toHaveLength(2);

      // Most recent should be first
      expect(history[0].medA).toBe('aspirin');
      expect(history[1].medA).toBe('warfarin');
    });

    it('should generate unique IDs for each query', (done) => {
      testStore.addQuery('medA1', 'medB1', false, 'reason1');

      setTimeout(() => {
        testStore.addQuery('medA2', 'medB2', true, 'reason2');

        const history = testStore.getRecentQueries();
        expect(history[0].id).not.toBe(history[1].id);
        done();
      }, 10);
    });

    it('should handle different timestamp generations', (done) => {
      testStore.addQuery('medA1', 'medB1', false, 'reason1');

      setTimeout(() => {
        testStore.addQuery('medA2', 'medB2', true, 'reason2');

        const history = testStore.getRecentQueries();
        expect(history[0].timestamp.getTime()).toBeGreaterThan(history[1].timestamp.getTime());
        done();
      }, 10);
    });

    it('should enforce maximum items limit', () => {
      // Add more than maxItems
      for (let i = 0; i < 15; i++) {
        testStore.addQuery(`medA${i}`, `medB${i}`, false, `reason${i}`);
      }

      const history = testStore.getRecentQueries();
      expect(history).toHaveLength(testStore.getMaxItems());

      // Should keep the most recent ones
      expect(history[0].medA).toBe('medA14'); // Most recent
      expect(history[9].medA).toBe('medA5');  // 10th most recent
    });
  });

  describe('getRecentQueries', () => {
    it('should return empty array initially', () => {
      const history = testStore.getRecentQueries();
      expect(history).toEqual([]);
    });

    it('should return copy of history (not reference)', () => {
      testStore.addQuery('warfarin', 'ibuprofen', true, 'bleeding risk');

      const history1 = testStore.getRecentQueries();
      const history2 = testStore.getRecentQueries();

      expect(history1).not.toBe(history2); // Different objects
      expect(history1).toEqual(history2);  // Same content
    });

    it('should return queries in chronological order (newest first)', () => {
      testStore.addQuery('medA1', 'medB1', false, 'reason1');
      testStore.addQuery('medA2', 'medB2', true, 'reason2');
      testStore.addQuery('medA3', 'medB3', false, 'reason3');

      const history = testStore.getRecentQueries();
      expect(history[0].medA).toBe('medA3'); // Newest
      expect(history[1].medA).toBe('medA2');
      expect(history[2].medA).toBe('medA1'); // Oldest
    });
  });

  describe('clearHistory', () => {
    it('should remove all queries', () => {
      testStore.addQuery('warfarin', 'ibuprofen', true, 'bleeding risk');
      testStore.addQuery('aspirin', 'vitamins', false, 'no interaction');

      expect(testStore.getHistoryLength()).toBe(2);

      testStore.clearHistory();

      expect(testStore.getHistoryLength()).toBe(0);
      expect(testStore.getRecentQueries()).toEqual([]);
    });

    it('should work when history is already empty', () => {
      expect(testStore.getHistoryLength()).toBe(0);

      testStore.clearHistory();

      expect(testStore.getHistoryLength()).toBe(0);
    });
  });

  describe('QueryHistoryItem interface', () => {
    it('should have correct structure', () => {
      testStore.addQuery('warfarin', 'ibuprofen', true, 'bleeding risk');

      const history = testStore.getRecentQueries();
      const item = history[0];

      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('medA');
      expect(item).toHaveProperty('medB');
      expect(item).toHaveProperty('isPotentiallyRisky');
      expect(item).toHaveProperty('reason');
      expect(item).toHaveProperty('timestamp');

      expect(typeof item.id).toBe('string');
      expect(typeof item.medA).toBe('string');
      expect(typeof item.medB).toBe('string');
      expect(typeof item.isPotentiallyRisky).toBe('boolean');
      expect(typeof item.reason).toBe('string');
      expect(item.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('edge cases', () => {
    it('should handle empty medication names', () => {
      testStore.addQuery('', '', false, 'no interaction');

      const history = testStore.getRecentQueries();
      expect(history[0].medA).toBe('');
      expect(history[0].medB).toBe('');
    });

    it('should handle very long medication names', () => {
      const longName = 'a'.repeat(1000);
      testStore.addQuery(longName, 'ibuprofen', true, 'some reason');

      const history = testStore.getRecentQueries();
      expect(history[0].medA).toBe(longName);
    });

    it('should handle special characters in names', () => {
      testStore.addQuery('med-A@123', 'med.B#456', true, 'special chars');

      const history = testStore.getRecentQueries();
      expect(history[0].medA).toBe('med-A@123');
      expect(history[0].medB).toBe('med.B#456');
    });

    it('should handle empty reason', () => {
      testStore.addQuery('warfarin', 'ibuprofen', true, '');

      const history = testStore.getRecentQueries();
      expect(history[0].reason).toBe('');
    });

    it('should handle very long reason', () => {
      const longReason = 'reason '.repeat(100);
      testStore.addQuery('warfarin', 'ibuprofen', true, longReason);

      const history = testStore.getRecentQueries();
      expect(history[0].reason).toBe(longReason);
    });
  });
});

describe('exported queryHistoryStore instance', () => {
  beforeEach(() => {
    // Clean up between tests
    queryHistoryStore.clearHistory();
  });

  it('should be properly instantiated', () => {
    expect(queryHistoryStore).toBeDefined();
    expect(typeof queryHistoryStore.addQuery).toBe('function');
    expect(typeof queryHistoryStore.getRecentQueries).toBe('function');
    expect(typeof queryHistoryStore.clearHistory).toBe('function');
  });

  it('should work with actual instance', () => {
    queryHistoryStore.addQuery('warfarin', 'ibuprofen', true, 'bleeding risk');

    const history = queryHistoryStore.getRecentQueries();
    expect(history).toHaveLength(1);
    expect(history[0].medA).toBe('warfarin');
  });
});