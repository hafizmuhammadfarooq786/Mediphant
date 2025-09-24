import SwiftUI

struct SettingsView: View {
    @State private var serverURL: String = "http://localhost:3000"
    @State private var showingConnectionTest = false
    @State private var connectionTestResult: String?
    @State private var isTestingConnection = false

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Server Configuration")) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("API Server URL")
                            .font(.caption)
                            .foregroundColor(.secondary)

                        TextField("Enter server URL", text: $serverURL)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .autocapitalization(.none)
                            .disableAutocorrection(true)
                            .keyboardType(.URL)

                        Text("Default: http://localhost:3000")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }

                    Button(action: {
                        Task {
                            await testConnection()
                        }
                    }) {
                        HStack {
                            if isTestingConnection {
                                ProgressView()
                                    .scaleEffect(0.8)
                            } else {
                                Image(systemName: "wifi")
                            }
                            Text(isTestingConnection ? "Testing..." : "Test Connection")
                        }
                    }
                    .disabled(isTestingConnection || serverURL.isEmpty)

                    if let connectionTestResult = connectionTestResult {
                        Text(connectionTestResult)
                            .font(.caption)
                            .foregroundColor(connectionTestResult.contains("Success") ? .green : .red)
                    }
                }

                Section(header: Text("Application Info")) {
                    InfoRowView(title: "Version", value: "1.0.0")
                    InfoRowView(title: "Build", value: "2024.09.24")
                    InfoRowView(title: "Platform", value: "iOS")
                    InfoRowView(title: "Framework", value: "SwiftUI")
                }

                Section(header: Text("Features")) {
                    FeatureRowView(
                        title: "Drug Interactions",
                        description: "Check potential interactions between medications",
                        icon: "exclamationmark.triangle",
                        isAvailable: true
                    )

                    FeatureRowView(
                        title: "FAQ Search",
                        description: "Search medical knowledge base with AI",
                        icon: "questionmark.circle",
                        isAvailable: true
                    )

                    FeatureRowView(
                        title: "History Tracking",
                        description: "View your recent interaction checks",
                        icon: "clock",
                        isAvailable: true
                    )

                    FeatureRowView(
                        title: "Offline Mode",
                        description: "Access basic features without internet",
                        icon: "airplane",
                        isAvailable: false
                    )
                }

                Section(header: Text("Safety Notice")) {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(.orange)
                            Text("Medical Disclaimer")
                                .font(.headline)
                                .foregroundColor(.orange)
                        }

                        Text("This application is for informational purposes only and does not constitute medical advice. Always consult with a healthcare professional for medical guidance.")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 4)
                }

                Section(header: Text("Support")) {
                    Button("Report an Issue") {
                        // In a real app, this would open a support form or email
                    }

                    Button("Privacy Policy") {
                        // In a real app, this would show privacy policy
                    }

                    Button("Terms of Service") {
                        // In a real app, this would show terms of service
                    }
                }

                Section(header: Text("Developer Info")) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Built for Mediphant Practical Test")
                            .font(.caption)
                            .foregroundColor(.secondary)

                        Text("September 2024")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 2)
                }
            }
            .navigationTitle("Settings")
        }
    }

    // MARK: - Actions
    @MainActor
    private func testConnection() async {
        isTestingConnection = true
        connectionTestResult = nil

        guard let url = URL(string: "\(serverURL)/api/faq?q=test") else {
            connectionTestResult = "Invalid URL format"
            isTestingConnection = false
            return
        }

        do {
            let (_, response) = try await URLSession.shared.data(from: url)

            if let httpResponse = response as? HTTPURLResponse {
                if httpResponse.statusCode == 200 {
                    connectionTestResult = "✅ Success: Server is reachable"
                } else {
                    connectionTestResult = "⚠️ Warning: Server responded with status \(httpResponse.statusCode)"
                }
            } else {
                connectionTestResult = "❌ Error: Invalid response from server"
            }
        } catch {
            connectionTestResult = "❌ Error: \(error.localizedDescription)"
        }

        isTestingConnection = false

        // Clear result after 5 seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
            connectionTestResult = nil
        }
    }
}

// MARK: - Info Row View
struct InfoRowView: View {
    let title: String
    let value: String

    var body: some View {
        HStack {
            Text(title)
            Spacer()
            Text(value)
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - Feature Row View
struct FeatureRowView: View {
    let title: String
    let description: String
    let icon: String
    let isAvailable: Bool

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(isAvailable ? .blue : .gray)
                .frame(width: 24, height: 24)

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.body)
                    .foregroundColor(isAvailable ? .primary : .secondary)

                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
            }

            Spacer()

            if isAvailable {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
            } else {
                Text("Coming Soon")
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(Color.gray.opacity(0.2))
                    .foregroundColor(.secondary)
                    .cornerRadius(4)
            }
        }
        .padding(.vertical, 2)
    }
}

// MARK: - Preview
struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
    }
}