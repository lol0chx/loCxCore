package com.loCxCore.ui;

import com.loCxCore.services.InputHandler;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class LedgerScreen {
    private static final Scanner scanner = new Scanner(System.in);

    // Displays ledger menu and handles user selections
    public void start() {
        boolean running = true;
        while (running) {
            System.out.println("\n═══════════════════════════════════════");
            System.out.println("        📊  LEDGER  📊");
            System.out.println("═══════════════════════════════════════");
            System.out.println();
            System.out.println("  1: 📋  View All Transactions");
            System.out.println("  2: 🔍  Search by Receipt ID");
            System.out.println("  0: 🔙  Back to Home");
            System.out.println();
            
            int choice = InputHandler.getIntInput("Choose an option: ", 0, 2);
            switch (choice) {
                case 1 -> viewAllTransactions();
                case 2 -> searchByReceiptId();
                case 0 -> running = false;
            }
        }
    }

    // Displays all transactions from the CSV file
    private void viewAllTransactions() {
        System.out.println("\n═══════════════════════════════════════");
        System.out.println("     📋  ALL TRANSACTIONS  📋");
        System.out.println("═══════════════════════════════════════\n");
        
        List<String> transactions = readTransactionsFile();
        
        if (transactions.isEmpty()) {
            System.out.println("  No transactions found.\n");
            return;
        }
        
        // Display header
        System.out.println("  Receipt ID         | Date       | Time     | Customer        | Amount");
        System.out.println("  ───────────────────────────────────────────────────────────────────────");
        
        // Display each transaction
        for (String transaction : transactions) {
            String[] parts = transaction.split("\\|");
            if (parts.length == 5) {
                System.out.printf("  %-18s | %-10s | %-8s | %-15s | $%-8s%n",
                    parts[0], parts[1], parts[2], parts[3], parts[4]);
            }
        }
        System.out.println();
    }

    // Searches for a specific transaction by receipt ID
    private void searchByReceiptId() {
        System.out.print("\n🔍 Enter Receipt ID (without hyphen: ");
        String searchId = scanner.nextLine().trim();
        
        List<String> transactions = readTransactionsFile();
        boolean found = false;
        
        for (String transaction : transactions) {
            String[] parts = transaction.split("\\|");
            if (parts.length == 5) {
                // Remove hyphen from stored receipt ID for comparison
                String storedId = parts[0].replace("-", "");
                if (storedId.equalsIgnoreCase(searchId)) {
                    System.out.println("\n═══════════════════════════════════════");
                    System.out.println("     ✅  TRANSACTION FOUND  ✅");
                    System.out.println("═══════════════════════════════════════\n");
                    System.out.println("  Receipt ID: " + parts[0]);
                    System.out.println("  Date:       " + parts[1]);
                    System.out.println("  Time:       " + parts[2]);
                    System.out.println("  Customer:   " + parts[3]);
                    System.out.println("  Amount:     $" + parts[4]);
                    System.out.println("\n═══════════════════════════════════════\n");
                    found = true;
                    break;
                }
            }
        }
        
        if (!found) {
            System.out.println("\n❌ No transaction found with Receipt ID: " + searchId + "\n");
        }
    }

    // Reads all transactions from the CSV file
    private List<String> readTransactionsFile() {
        List<String> transactions = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(new FileReader("transactions.csv"))) {
            String line;
            boolean firstLine = true;
            while ((line = reader.readLine()) != null) {
                // Skip header line
                if (firstLine) {
                    firstLine = false;
                    continue;
                }
                transactions.add(line);
            }
        } catch (IOException e) {
            System.out.println("❌ Could not read transactions file: " + e.getMessage());
        }
        
        return transactions;
    }
}
