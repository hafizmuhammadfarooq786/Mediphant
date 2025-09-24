import SwiftUI
import Foundation

// MARK: - Data Models
struct QueryHistoryItem: Codable, Identifiable {
    let id: String
    let medA: String
    let medB: String
    let isPotentiallyRisky: Bool
    let reason: String
    let timestamp: Date
}

struct HistoryResponse: Codable {
    let history: [QueryHistoryItem]
}

// MARK: - History Service
class HistoryService: ObservableObject {
    private let baseURL: String

    init(baseURL: String = "http://localhost:3000") {
        self.baseURL = baseURL
    }

    func fetchHistory() async throws -> [QueryHistoryItem] {
        guard let url = URL(string: "\(baseURL)/api/history") else {
            throw HistoryError.invalidURL
        }

        let (data, response) = try await URLSession.shared.data(from: url)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw HistoryError.invalidResponse
        }

        guard httpResponse.statusCode == 200 else {
            throw HistoryError.serverError(statusCode: httpResponse.statusCode)
        }

        do {
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            let historyResponse = try decoder.decode(HistoryResponse.self, from: data)
            return historyResponse.history
        } catch {
            throw HistoryError.decodingError(error)
        }
    }

    func clearHistory() async throws {
        guard let url = URL(string: "\(baseURL)/api/history") else {
            throw HistoryError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"

        let (_, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw HistoryError.invalidResponse
        }

        guard httpResponse.statusCode == 200 else {
            throw HistoryError.serverError(statusCode: httpResponse.statusCode)
        }
    }
}

// MARK: - Error Types
enum HistoryError: LocalizedError {
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
struct HistoryView: View {
    @StateObject private var historyService = HistoryService()
    @State private var history: [QueryHistoryItem] = []
    @State private var isLoading: Bool = false
    @State private var errorMessage: String?
    @State private var showingClearConfirmation = false

    var body: some View {
        NavigationView {
            VStack {
                if isLoading {
                    loadingView
                } else if history.isEmpty {
                    emptyStateView
                } else {
                    historyListView
                }
            }
            .navigationTitle("History")
            .toolbar {
                ToolbarItemGroup(placement: .navigationBarTrailing) {
                    Button("Refresh") {
                        Task {
                            await loadHistory()
                        }
                    }

                    if !history.isEmpty {
                        Button("Clear") {
                            showingClearConfirmation = true
                        }
                        .foregroundColor(.red)
                    }
                }
            }
            .onAppear {
                Task {
                    await loadHistory()
                }
            }
            .alert("Clear History", isPresented: $showingClearConfirmation) {
                Button("Cancel", role: .cancel) { }
                Button("Clear All", role: .destructive) {
                    Task {
                        await clearAllHistory()
                    }
                }
            } message: {
                Text("This will permanently delete all interaction history. This action cannot be undone.")
            }
        }
    }

    // MARK: - View Components
    private var loadingView: some View {
        VStack {
            Spacer()
            ProgressView("Loading history...")
            Spacer()
        }
    }

    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Spacer()

            Image(systemName: "clock")
                .font(.system(size: 60))
                .foregroundColor(.gray)

            VStack(spacing: 8) {
                Text("No History Available")
                    .font(.title2)
                    .fontWeight(.medium)

                Text("Your interaction checks will appear here")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }

            Spacer()

            if let errorMessage = errorMessage {
                Text(errorMessage)
                    .font(.caption)
                    .foregroundColor(.red)
                    .padding()
            }
        }
        .padding()
    }

    private var historyListView: some View {
        VStack {
            if let errorMessage = errorMessage {
                Text(errorMessage)
                    .font(.caption)
                    .foregroundColor(.red)
                    .padding()
            }

            List {
                ForEach(history) { item in
                    HistoryRowView(item: item)
                }
            }
            .listStyle(PlainListStyle())

            // Statistics
            statisticsView
        }
    }

    private var statisticsView: some View {
        HStack(spacing: 20) {
            StatisticView(
                title: "Total Checks",
                value: "\(history.count)",
                color: .blue
            )

            StatisticView(
                title: "Risky",
                value: "\(history.filter(\.isPotentiallyRisky).count)",
                color: .red
            )

            StatisticView(
                title: "Safe",
                value: "\(history.filter { !$0.isPotentiallyRisky }.count)",
                color: .green
            )
        }
        .padding()
        .background(Color.gray.opacity(0.05))
    }

    // MARK: - Actions
    @MainActor
    private func loadHistory() async {
        isLoading = true
        errorMessage = nil

        do {
            let fetchedHistory = try await historyService.fetchHistory()
            history = fetchedHistory
        } catch let error as HistoryError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = "An unexpected error occurred: \(error.localizedDescription)"
        }

        isLoading = false
    }

    @MainActor
    private func clearAllHistory() async {
        do {
            try await historyService.clearHistory()
            history = []
            errorMessage = nil
        } catch let error as HistoryError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = "Failed to clear history: \(error.localizedDescription)"
        }
    }
}

// MARK: - History Row View
struct HistoryRowView: View {
    let item: QueryHistoryItem

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                // Risk indicator
                Image(systemName: item.isPotentiallyRisky ? "exclamationmark.triangle.fill" : "checkmark.circle.fill")
                    .foregroundColor(item.isPotentiallyRisky ? .red : .green)

                // Medications
                Text("\(item.medA) + \(item.medB)")
                    .font(.headline)
                    .lineLimit(1)

                Spacer()

                // Status badge
                Text(item.isPotentiallyRisky ? "Risk" : "Safe")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(item.isPotentiallyRisky ? Color.red.opacity(0.1) : Color.green.opacity(0.1))
                    .foregroundColor(item.isPotentiallyRisky ? .red : .green)
                    .cornerRadius(4)
            }

            // Reason
            Text(item.reason)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineLimit(2)

            // Timestamp
            Text(formatDate(item.timestamp))
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.dateTimeStyle = .named
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}

// MARK: - Statistic View
struct StatisticView: View {
    let title: String
    let value: String
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(color)

            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Preview
struct HistoryView_Previews: PreviewProvider {
    static var previews: some View {
        HistoryView()
    }
}