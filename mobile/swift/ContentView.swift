import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            DrugInteractionsView()
                .tabItem {
                    Image(systemName: "exclamationmark.triangle")
                    Text("Interactions")
                }
                .tag(0)

            FaqView()
                .tabItem {
                    Image(systemName: "questionmark.circle")
                    Text("FAQ Search")
                }
                .tag(1)

            HistoryView()
                .tabItem {
                    Image(systemName: "clock")
                    Text("History")
                }
                .tag(2)

            SettingsView()
                .tabItem {
                    Image(systemName: "gear")
                    Text("Settings")
                }
                .tag(3)
        }
        .accentColor(.blue)
    }
}

// MARK: - Preview
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}