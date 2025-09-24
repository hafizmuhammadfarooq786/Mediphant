export interface QueryHistoryItem {
  id: string;
  medA: string;
  medB: string;
  isPotentiallyRisky: boolean;
  reason: string;
  timestamp: Date;
}

// In-memory store (would be replaced with database in production)
class QueryHistoryStore {
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

    // Keep only the most recent items
    if (this.history.length > this.maxItems) {
      this.history = this.history.slice(0, this.maxItems);
    }
  }

  getRecentQueries(): QueryHistoryItem[] {
    return [...this.history]; // Return a copy
  }

  clearHistory(): void {
    this.history = [];
  }
}

export const queryHistoryStore = new QueryHistoryStore();