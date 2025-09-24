import SwiftUI
import Foundation

// MARK: - Data Models
struct InteractionRequest: Codable {
    let medA: String
    let medB: String
}

struct InteractionResponse: Codable {
    let pair: [String]
    let isPotentiallyRisky: Bool
    let reason: String
    let advice: String
}

// MARK: - Interactions Service
class InteractionService: ObservableObject {
    private let baseURL: String

    init(baseURL: String = "http://localhost:3000") {
        self.baseURL = baseURL
    }

    func checkInteraction(medA: String, medB: String) async throws -> InteractionResponse {
        guard let url = URL(string: "\(baseURL)/api/interactions") else {
            throw InteractionError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let requestBody = InteractionRequest(medA: medA, medB: medB)

        do {
            request.httpBody = try JSONEncoder().encode(requestBody)
        } catch {
            throw InteractionError.encodingError(error)
        }

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw InteractionError.invalidResponse
        }

        guard httpResponse.statusCode == 200 else {
            throw InteractionError.serverError(statusCode: httpResponse.statusCode)
        }

        do {
            return try JSONDecoder().decode(InteractionResponse.self, from: data)
        } catch {
            throw InteractionError.decodingError(error)
        }
    }
}

// MARK: - Error Types
enum InteractionError: LocalizedError {
    case invalidURL
    case invalidResponse
    case serverError(statusCode: Int)
    case decodingError(Error)
    case encodingError(Error)
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
        case .encodingError:
            return "Failed to encode request"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        }
    }
}

// MARK: - Main View
struct DrugInteractionsView: View {
    @StateObject private var interactionService = InteractionService()
    @State private var medA: String = "warfarin"
    @State private var medB: String = "ibuprofen"
    @State private var result: InteractionResponse?
    @State private var isLoading: Bool = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    headerSection
                    inputSection
                    quickTestSection
                    resultSection
                }
                .padding()
            }
            .navigationTitle("Drug Interactions")
        }
    }

    // MARK: - View Components
    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Check medication interactions")
                .font(.headline)
                .foregroundColor(.secondary)

            Text("IMPORTANT: For informational purposes only. Always consult healthcare professionals.")
                .font(.caption)
                .foregroundColor(.orange)
                .padding(.vertical, 4)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var inputSection: some View {
        VStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                Text("First Medication")
                    .font(.caption)
                    .foregroundColor(.secondary)
                TextField("Enter medication name", text: $medA)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("Second Medication")
                    .font(.caption)
                    .foregroundColor(.secondary)
                TextField("Enter medication name", text: $medB)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
            }

            Button(action: {
                Task {
                    await performCheck()
                }
            }) {
                HStack {
                    if isLoading {
                        ProgressView()
                            .scaleEffect(0.8)
                    } else {
                        Image(systemName: "exclamationmark.triangle")
                    }
                    Text(isLoading ? "Checking..." : "Check Interactions")
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.red)
                .foregroundColor(.white)
                .cornerRadius(8)
            }
            .disabled(medA.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ||
                     medB.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ||
                     isLoading)
        }
    }

    private var quickTestSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Quick test combinations:")
                .font(.caption)
                .foregroundColor(.secondary)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                quickTestButton("Warfarin", "Ibuprofen")
                quickTestButton("Metformin", "Contrast dye")
                quickTestButton("Lisinopril", "Spironolactone")
                quickTestButton("Aspirin", "Vitamins")
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func quickTestButton(_ medA: String, _ medB: String) -> some View {
        Button(action: {
            self.medA = medA
            self.medB = medB
        }) {
            VStack(spacing: 2) {
                Text(medA)
                    .font(.caption)
                    .fontWeight(.medium)
                Text("+ \(medB)")
                    .font(.caption2)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 8)
            .padding(.horizontal, 4)
            .background(Color.gray.opacity(0.1))
            .foregroundColor(.primary)
            .cornerRadius(6)
        }
    }

    private var resultSection: some View {
        VStack {
            if let errorMessage = errorMessage {
                errorView(message: errorMessage)
            } else if let result = result {
                resultView(result: result)
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

    private func resultView(result: InteractionResponse) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header with risk indicator
            HStack {
                Image(systemName: result.isPotentiallyRisky ? "exclamationmark.triangle.fill" : "checkmark.circle.fill")
                    .foregroundColor(result.isPotentiallyRisky ? .red : .green)
                    .font(.title2)

                VStack(alignment: .leading) {
                    Text(result.isPotentiallyRisky ? "Potential Risk Detected" : "No Known Interactions")
                        .font(.headline)
                        .foregroundColor(result.isPotentiallyRisky ? .red : .green)

                    Text("\(result.pair[0]) + \(result.pair[1])")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }

                Spacer()
            }

            // Reason
            VStack(alignment: .leading, spacing: 8) {
                Text("Details")
                    .font(.headline)
                    .foregroundColor(.primary)

                Text(result.reason)
                    .font(.body)
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)
            }

            // Advice (only for risky interactions)
            if result.isPotentiallyRisky {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Medical Advice")
                        .font(.headline)
                        .foregroundColor(.orange)

                    Text(result.advice)
                        .font(.body)
                        .padding()
                        .background(Color.orange.opacity(0.1))
                        .cornerRadius(8)
                }
            }
        }
        .padding()
        .background(result.isPotentiallyRisky ? Color.red.opacity(0.05) : Color.green.opacity(0.05))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(result.isPotentiallyRisky ? Color.red.opacity(0.3) : Color.green.opacity(0.3), lineWidth: 1)
        )
    }

    // MARK: - Actions
    @MainActor
    private func performCheck() async {
        let medAText = medA.trimmingCharacters(in: .whitespacesAndNewlines)
        let medBText = medB.trimmingCharacters(in: .whitespacesAndNewlines)

        guard !medAText.isEmpty && !medBText.isEmpty else { return }

        isLoading = true
        errorMessage = nil
        result = nil

        do {
            let interactionResult = try await interactionService.checkInteraction(medA: medAText, medB: medBText)
            result = interactionResult
        } catch let error as InteractionError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = "An unexpected error occurred: \(error.localizedDescription)"
        }

        isLoading = false
    }
}

// MARK: - Preview
struct DrugInteractionsView_Previews: PreviewProvider {
    static var previews: some View {
        DrugInteractionsView()
    }
}