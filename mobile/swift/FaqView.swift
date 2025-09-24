import SwiftUI
import Foundation

// MARK: - Data Models
struct FAQResponse: Codable {
    let answer: String
    let matches: [SearchMatch]
}

struct SearchMatch: Codable {
    let text: String
    let score: Double
}

// MARK: - FAQ Service
class FAQService: ObservableObject {
    private let baseURL: String

    init(baseURL: String = "http://localhost:3000") {
        self.baseURL = baseURL
    }

    func searchFAQ(query: String) async throws -> FAQResponse {
        guard let encodedQuery = query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let url = URL(string: "\(baseURL)/api/faq?q=\(encodedQuery)") else {
            throw FAQError.invalidURL
        }

        let (data, response) = try await URLSession.shared.data(from: url)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw FAQError.invalidResponse
        }

        guard httpResponse.statusCode == 200 else {
            throw FAQError.serverError(statusCode: httpResponse.statusCode)
        }

        do {
            return try JSONDecoder().decode(FAQResponse.self, from: data)
        } catch {
            throw FAQError.decodingError(error)
        }
    }
}

// MARK: - Error Types
enum FAQError: LocalizedError {
    case invalidURL
    case invalidResponse
    case serverError(statusCode: Int)
    case decodingError(Error)
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .serverError(let statusCode):
            return "Server error: \(statusCode)"
        case .decodingError:
            return "Failed to decode response"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        }
    }
}

// MARK: - Main View
struct FaqView: View {
    @StateObject private var faqService = FAQService()
    @State private var query: String = "medication adherence"
    @State private var result: FAQResponse?
    @State private var isLoading: Bool = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                headerSection
                searchSection
                resultSection
                Spacer()
            }
            .padding()
            .navigationTitle("Medical FAQ")
        }
    }

    // MARK: - View Components
    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Ask about medications and health topics")
                .font(.headline)
                .foregroundColor(.secondary)

            Text("IMPORTANT: For informational purposes only. Always consult healthcare professionals.")
                .font(.caption)
                .foregroundColor(.orange)
                .padding(.vertical, 4)
        }
    }

    private var searchSection: some View {
        VStack(spacing: 12) {
            TextField("Enter your question...", text: $query)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .onSubmit {
                    Task {
                        await performSearch()
                    }
                }

            Button(action: {
                Task {
                    await performSearch()
                }
            }) {
                HStack {
                    if isLoading {
                        ProgressView()
                            .scaleEffect(0.8)
                    } else {
                        Image(systemName: "magnifyingglass")
                    }
                    Text(isLoading ? "Searching..." : "Search FAQ")
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(8)
            }
            .disabled(query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isLoading)
        }
    }

    private var resultSection: some View {
        VStack {
            if let errorMessage = errorMessage {
                errorView(message: errorMessage)
            } else if let result = result {
                successView(result: result)
            }
        }
    }

    private func errorView(message: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundColor(.red)
                Text("Error")
                    .font(.headline)
                    .foregroundColor(.red)
                Spacer()
            }

            Text(message)
                .font(.body)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color.red.opacity(0.1))
        .cornerRadius(8)
    }

    private func successView(result: FAQResponse) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            // Answer Section
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: "lightbulb.fill")
                        .foregroundColor(.blue)
                    Text("Answer")
                        .font(.headline)
                        .foregroundColor(.blue)
                    Spacer()
                }

                Text(result.answer)
                    .font(.body)
                    .padding()
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(8)
            }

            // Matches Section
            if !result.matches.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Image(systemName: "doc.text")
                            .foregroundColor(.green)
                        Text("Related Information")
                            .font(.headline)
                            .foregroundColor(.green)
                        Spacer()
                    }

                    ForEach(Array(result.matches.enumerated()), id: \.offset) { index, match in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text("Match \(index + 1)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                Spacer()
                                Text(String(format: "%.1f%%", match.score * 100))
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }

                            Text(match.text)
                                .font(.caption)
                                .padding(.vertical, 4)
                        }
                        .padding()
                        .background(Color.green.opacity(0.1))
                        .cornerRadius(6)
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - Actions
    @MainActor
    private func performSearch() async {
        let searchQuery = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !searchQuery.isEmpty else { return }

        isLoading = true
        errorMessage = nil
        result = nil

        do {
            let searchResult = try await faqService.searchFAQ(query: searchQuery)
            result = searchResult
        } catch let error as FAQError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = "An unexpected error occurred: \(error.localizedDescription)"
        }

        isLoading = false
    }
}

// MARK: - Preview
struct FaqView_Previews: PreviewProvider {
    static var previews: some View {
        FaqView()
    }
}