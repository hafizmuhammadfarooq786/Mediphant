# Mediphant iOS App

Native iOS application for the Mediphant medical interaction checking system.

## Features

### 🧪 Drug Interactions
- Check potential interactions between two medications
- Pre-filled test combinations for quick testing
- Visual risk indicators with detailed explanations
- Medical advice for risky combinations

### 🔍 FAQ Search
- Search medical knowledge base with natural language queries
- AI-powered semantic search with fallback support
- Relevance scoring for search results
- Popular query suggestions

### 📊 History Tracking
- View recent medication interaction checks
- Statistics dashboard (total, risky, safe combinations)
- Clear all history functionality
- Relative timestamp formatting

### ⚙️ Settings
- Configurable API server endpoint
- Connection testing functionality
- Application information and version details
- Medical disclaimers and safety notices

## Technical Architecture

### SwiftUI Framework
- **Native iOS**: Built with SwiftUI for iOS 16+
- **Declarative UI**: Modern reactive interface patterns
- **Navigation**: Tab-based navigation with proper state management
- **Async/Await**: Modern concurrency for API calls

### Network Layer
- **URLSession**: Native HTTP client with async/await
- **Codable**: Type-safe JSON serialization
- **Error Handling**: Comprehensive error types and user feedback
- **Configurable Endpoints**: Adjustable server URL in settings

### Data Models
```swift
struct InteractionResponse: Codable {
    let pair: [String]
    let isPotentiallyRisky: Bool
    let reason: String
    let advice: String
}

struct FAQResponse: Codable {
    let answer: String
    let matches: [SearchMatch]
}

struct QueryHistoryItem: Codable {
    let id: String
    let medA: String
    let medB: String
    let isPotentiallyRisky: Bool
    let reason: String
    let timestamp: Date
}
```

## API Integration

The app integrates with the Mediphant web API:

- **POST /api/interactions** - Check medication interactions
- **GET /api/faq?q=query** - Search medical FAQ
- **GET /api/history** - Fetch interaction history
- **DELETE /api/history** - Clear interaction history

## Project Structure

```
mobile/
├── swift/                          # SwiftUI source files
│   ├── MediphantApp.swift          # App entry point
│   ├── ContentView.swift           # Main tab navigation
│   ├── DrugInteractionsView.swift  # Interaction checker
│   ├── FaqView.swift               # FAQ search
│   ├── HistoryView.swift           # History tracking
│   └── SettingsView.swift          # App settings
├── ios/                            # iOS project configuration
│   └── Info.plist                 # App metadata and permissions
├── Package.swift                   # Swift Package Manager config
└── README.md                       # This file
```

## Running the Application

### Prerequisites
- Xcode 15.0 or later
- iOS 16.0+ device or simulator
- Running Mediphant web server (default: http://localhost:3000)

### Setup Instructions

1. **Open in Xcode**
   ```bash
   open mobile/Package.swift
   ```

2. **Configure Server URL**
   - Launch the app and go to Settings tab
   - Update the API Server URL if needed
   - Test connection to verify connectivity

3. **Build and Run**
   - Select target device or simulator
   - Press Cmd+R to build and run

### Development Notes

- **No External Dependencies**: Uses only native iOS frameworks
- **Offline Capable**: Basic UI works without network connectivity
- **Network Security**: Configured for localhost development in Info.plist
- **Error Handling**: Comprehensive error states with user-friendly messages

## Usage Examples

### Drug Interaction Check
1. Open "Interactions" tab
2. Use pre-filled values or enter medication names
3. Tap quick test buttons for common combinations
4. Review risk assessment and medical advice

### FAQ Search
1. Open "FAQ Search" tab
2. Enter medical question (default: "medication adherence")
3. Review AI-generated answer and source matches
4. Try popular queries from suggestion buttons

### History Review
1. Open "History" tab
2. View chronological list of past checks
3. Review statistics dashboard
4. Clear history if needed

## Medical Safety

⚠️ **Important Medical Disclaimer**: This application is for informational purposes only and does not constitute medical advice. Always consult with a healthcare professional for medical guidance.

## Development Info

- **Framework**: SwiftUI + Foundation
- **Minimum iOS**: 16.0
- **Language**: Swift 5.9
- **Architecture**: MVVM with ObservableObject
- **Concurrency**: async/await for network calls
- **JSON Handling**: Codable protocol
- **Date Formatting**: RelativeDateTimeFormatter

Built for Mediphant Practical Test - September 2024