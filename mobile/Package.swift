// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MediphantMobile",
    platforms: [
        .iOS(.v16),
        .macOS(.v13)
    ],
    products: [
        .library(
            name: "MediphantMobile",
            targets: ["MediphantMobile"]
        ),
    ],
    dependencies: [
        // No external dependencies - using native SwiftUI and Foundation
    ],
    targets: [
        .target(
            name: "MediphantMobile",
            dependencies: [],
            path: "swift",
            sources: [
                "MediphantApp.swift",
                "ContentView.swift",
                "DrugInteractionsView.swift",
                "FaqView.swift",
                "HistoryView.swift",
                "SettingsView.swift"
            ]
        ),
        .testTarget(
            name: "MediphantMobileTests",
            dependencies: ["MediphantMobile"],
            path: "tests"
        ),
    ]
)