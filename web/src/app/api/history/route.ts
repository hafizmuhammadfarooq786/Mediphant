import { NextResponse } from 'next/server';
import { queryHistoryStore } from '@/lib/queryHistory';

export async function GET() {
  try {
    const history = queryHistoryStore.getRecentQueries();
    return NextResponse.json({ history });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    queryHistoryStore.clearHistory();
    return NextResponse.json({ message: 'History cleared successfully' });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}