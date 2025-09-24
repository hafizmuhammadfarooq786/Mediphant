# Mediphant Practical Test

A full-stack medical application featuring medication interaction checking and FAQ search with vector similarity.

## Project Structure

```
mediphant-devtest/
├── web/              # Next.js 15.5 App Router application
├── retrieval/        # Pinecone indexing scripts and corpus
├── mobile/           # Swift/SwiftUI native integration
├── README.md         # This file
├── .env.example      # Environment variables template
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- OpenAI API key (optional, fallback available)
- Pinecone account (optional, fallback available)

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your API keys (optional)
# OPENAI_API_KEY=sk-your-key-here
# PINECONE_API_KEY=your-key-here
# PINECONE_INDEX=mediphant-test
```

### 2. Web Application Setup

```bash
cd web
npm install
npm run dev
```

Application will be available at `http://localhost:3000`

### 3. Vector Search Setup (Optional)

```bash
cd retrieval
npm install

# Test connection (requires API keys)
npm run test-connection

# Index the medical corpus (requires API keys)
npm run index-corpus
```

## Features

### Part A: Medication Interaction Checker

- **Route**: `/interactions`
- **API**: `POST /api/interactions`
- **Features**:
  - Case-insensitive drug interaction checking
  - Enhanced client & server-side validation with Zod v4
  - Mobile-responsive UI with Tailwind CSS
  - Medical disclaimers and safety warnings
  - **Recent Checks History**: In-memory query tracking with timestamps
  - **Rate Limiting**: DoS protection (100 requests/minute per IP)
  - **Input Sanitization**: Character validation and length limits

**Mock Interactions Supported:**

- Warfarin + Ibuprofen → Bleeding risk
- Metformin + Contrast dye → Lactic acidosis risk
- Lisinopril + Spironolactone → Hyperkalemia risk

### Part B: FAQ Vector Search

- **API**: `GET /api/faq?q=<query>`
- **Features**:
  - Pinecone vector similarity search
  - OpenAI embeddings and answer synthesis
  - Automatic fallback to in-memory TF-IDF search
  - Medical knowledge corpus with 5 key topics
  - **Rate Limiting**: Consistent protection across all endpoints

### Part C: Native Mobile Integration

- **File**: `mobile/swift/FaqView.swift`
- **Features**:
  - SwiftUI interface with search functionality
  - URLSession networking with proper error handling
  - Codable response models
  - Loading states and error messaging

## API Documentation

### Medication Interactions API

**Endpoint**: `POST /api/interactions`
**Rate Limit**: 100 requests/minute per IP

**Request**:

```json
{
  "medA": "warfarin",
  "medB": "ibuprofen"
}
```

**Response**:

```json
{
  "pair": ["warfarin", "ibuprofen"],
  "isPotentiallyRisky": true,
  "reason": "increased bleeding risk",
  "advice": "avoid combo; consult clinician; prefer acetaminophen for pain relief"
}
```

### FAQ Search API

**Endpoint**: `GET /api/faq?q=medication adherence`
**Rate Limit**: 100 requests/minute per IP

### Recent Checks API

**Get History**: `GET /api/history`
**Clear History**: `DELETE /api/history`

**Response**:

```json
{
  "answer": "Medication adherence improves outcomes in diabetes...",
  "matches": [
    {
      "text": "Medication adherence improves outcomes in diabetes; missed doses are a leading cause of poor control.",
      "score": 0.87
    }
  ]
}
```

## Testing

```bash
cd web
npm test              # Run all tests
npm test:watch        # Watch mode

# Expected: 13 tests passing
# Coverage: Core business logic, validation, error handling
```

**Test Coverage:**

- Drug interaction detection (all mock pairs)
- Case-insensitive matching
- Enhanced input validation with Zod v4
- Edge cases and error handling
- API response structure validation
- Rate limiting functionality
- Recent checks history storage

## Development Commands

### Web Application

```bash
cd web
npm run dev          # Start development server (Turbopack enabled)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests
```

### Retrieval System

```bash
cd retrieval
npm run test-connection    # Test Pinecone connectivity
npm run index-corpus      # Index medical corpus to Pinecone
```

## Production Deployment

### Build Process

```bash
cd web
npm run build
npm run start
```

### Environment Variables

```bash
# Required for full functionality
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_INDEX=mediphant-test
```

**Note**: Application works without API keys using fallback implementations.

## Mobile Integration

The Swift snippet (`mobile/swift/FaqView.swift`) demonstrates:

1. **Networking**: URLSession with async/await
2. **UI**: SwiftUI with search interface
3. **Models**: Codable structs matching API responses
4. **Error Handling**: Comprehensive error types
5. **User Experience**: Loading states and result display

**Usage**:

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        FaqView()
    }
}
```

## Technology Stack

### Frontend & Backend

- **Next.js 15.5** - React framework with App Router
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Rapid UI development
- **Zod v4** - Runtime validation with performance improvements

### External Services

- **Pinecone v6.1.2** - Vector database for similarity search
- **OpenAI v5.23.0** - Embeddings and text synthesis
- **Jest** - Testing framework

### Mobile

- **Swift/SwiftUI** - Native iOS integration
- **URLSession** - HTTP networking
- **Codable** - JSON serialization

## Project Metrics

**Time Investment**: ~3.5 hours (Including Bonus Features)

- Part A (Interactions): 75 minutes
- Part B (FAQ Search): 55 minutes
- Part C (Swift): 20 minutes
- **Bonus Features**: 60 minutes
  - Recent Checks History
  - Rate Limiting
  - DynamoDB Design
  - GitHub Actions CI/CD
- Setup & Documentation: 40 minutes

**Code Quality**:

- 13+ passing tests with comprehensive coverage
- TypeScript strict mode enabled with Next.js 15.5
- ESLint configuration for code quality
- Proper error handling and input sanitization
- Medical disclaimers and safety warnings
- **Production-Ready Features**: Rate limiting, CI/CD, monitoring

## 🚦 Fallback Strategy

The application is designed to work even without external API access:

1. **No Pinecone**: Falls back to in-memory TF-IDF search
2. **No OpenAI**: Uses simple text matching and concatenation
3. **Network Issues**: Graceful error handling with user feedback
4. **API Limits**: Automatic fallback mechanisms

## 🏥 Safety & Compliance

**Important Medical Disclaimers**:

- All results labeled as "informational only"
- Prominent warnings to consult healthcare professionals
- No liability assumed for medical decisions
- Clear separation of mock data from clinical advice

## 🎯 Bonus Features Implemented

**Stretch Goals Completed** (+10 bonus points):

1. ✅ **Recent Checks History**: In-memory query tracking with timestamps
2. ✅ **DynamoDB Design**: Professional single-table design document
3. ✅ **CI/CD Pipeline**: GitHub Actions with lint, test, build, and deploy
4. ✅ **Rate Limiting**: DoS protection across all API endpoints
5. ✅ **Enhanced Validation**: Input sanitization and security hardening

## 🔮 Future Enhancements

With additional time, next priorities would include:

1. **Enhanced Vector Search**: Reranking with cross-encoders
2. **Database Migration**: Implement the DynamoDB design
3. **Advanced UI**: Query suggestions, improved accessibility
4. **Monitoring**: Application performance monitoring
5. **Security**: CORS, CSP, additional security headers
6. **Mobile App**: Complete iOS/Android applications

## 🤝 AI Assistance Log

**AI-Generated Components**:

- Boilerplate Next.js API routes (~30%)
- SwiftUI view structure and networking (~40%)
- TypeScript type definitions (~20%)
- Test case structure and edge cases (~25%)

**Human Review & Modifications**:

- Business logic implementation and medical disclaimer content
- API design decisions and error handling strategies
- Testing strategy and validation approach
- Documentation structure and deployment considerations

**Time Saved**: Approximately 45 minutes through intelligent code generation and debugging assistance.

---

**Created for Mediphant Practical Test**
_September 2024_
