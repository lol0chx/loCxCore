package com.loCxCore.ui;

import com.loCxCore.orders.Order;
import com.loCxCore.services.InputHandler;

public class HomeScreen {

    public void startHome() {
        boolean running = true;
        while (running) {
            System.out.println("\n");
            System.out.println("═══════════════════════════════════════");
            System.out.println("        🍕  PIZZAPOINT  🍕");
            System.out.println("    Your Favorite Pizza Destination!");
            System.out.println("═══════════════════════════════════════");
            System.out.println();
            System.out.println("  1: 🛒  New Order");
            System.out.println("  2: 📊  Ledger");
            System.out.println("  0: 🚪  Exit");
            System.out.println();
            int choice = InputHandler.getIntInput("Choose an option: ", 0, 2);
            switch (choice) {
                case 1 -> {
                    Order order = new Order();
                    new NewOrderScreen(order).startOrder();
                }
                case 2 -> {
                    new LedgerScreen().start();
                }
                case 0 -> {
                    System.out.println("\n  Thank you for visiting! 🍕");
                    System.out.println("  See you soon! 👋\n");
                    running = false;
                }
            }
        }
    }
}

