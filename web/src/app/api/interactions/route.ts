import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkInteraction } from '@/lib/interactions';
import { queryHistoryStore } from '@/lib/queryHistory';
import { rateLimiter } from '@/lib/rateLimit';
import {
  ERROR_MESSAGES,
  VALIDATION_PATTERNS,
} from '@/lib/constants';

const InteractionRequestSchema = z.object({
  medA: z.string()
    .min(VALIDATION_PATTERNS.MIN_MEDICATION_LENGTH, ERROR_MESSAGES.REQUIRED_FIELD)
    .max(VALIDATION_PATTERNS.MAX_MEDICATION_LENGTH, ERROR_MESSAGES.MEDICATION_NAME_TOO_LONG)
    .trim()
    .regex(VALIDATION_PATTERNS.MEDICATION_NAME, ERROR_MESSAGES.INVALID_MEDICATION_NAME),
  medB: z.string()
    .min(VALIDATION_PATTERNS.MIN_MEDICATION_LENGTH, ERROR_MESSAGES.REQUIRED_FIELD)
    .max(VALIDATION_PATTERNS.MAX_MEDICATION_LENGTH, ERROR_MESSAGES.MEDICATION_NAME_TOO_LONG)
    .trim()
    .regex(VALIDATION_PATTERNS.MEDICATION_NAME, ERROR_MESSAGES.INVALID_MEDICATION_NAME),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!rateLimiter.isAllowed(clientIp)) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const body = await request.json();

    // Validate input with Zod
    const validatedData = InteractionRequestSchema.parse(body);
    const { medA, medB } = validatedData;

    // Check for duplicate medications
    if (medA.toLowerCase().trim() === medB.toLowerCase().trim()) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.DUPLICATE_MEDICATIONS },
        { status: 400 }
      );
    }

    // Check interaction
    const result = checkInteraction(medA, medB);

    // Store query in history
    queryHistoryStore.addQuery(medA, medB, result.isPotentiallyRisky, result.reason);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }

    console.error('Interaction API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to check interactions.' },
    { status: 405 }
  );
}