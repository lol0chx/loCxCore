package com.loCxCore.orders;

import com.loCxCore.core.enums.PizzaSize;
import com.loCxCore.core.interfaces.Orderable;
import com.loCxCore.menu.drink.Drink;
import com.loCxCore.menu.GarlicKnots;
import com.loCxCore.menu.pizza.Pizza;
import com.loCxCore.menu.pizza.topping.ToppingOption;
import com.loCxCore.services.PriceCalculator;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class Receipt {
    private final Order order;
    private final List<String> notes = new ArrayList<>();
    private Double cashTendered;
    private Double cashChange;

    public Receipt (Order order) {
        this.order = order;
    }
    
    // Constructor for web-based orders with payment details
    public Receipt(Order order, double cashTendered, double cashChange) {
        this.order = order;
        this.cashTendered = cashTendered;
        this.cashChange = cashChange;
    }

    // Generates formatted receipt text with header, items, and footer
    public String generate() {
        return generate(false);
    }
    
    // Generates formatted receipt text with optional thank you message
    public String generate(boolean includeThanks) {
        int itemNumber = 1;
        StringBuilder receipt = new StringBuilder();
        
        // Add customer name or just set it to guest
        String customerName = order.getCustomerName();
        String dateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        
        receipt.append("\n");
        receipt.append("═══════════════════════════════════════\n");
        receipt.append("          🍕 PIZZAPOINT 🍕\n");
        receipt.append("═══════════════════════════════════════\n\n");
        
        if (customerName != null && !customerName.isBlank()) {
            receipt.append("  Customer: ").append(customerName).append("\n");
            receipt.append("  Date: ").append(dateTime).append("\n");
            receipt.append("  Items: ").append(order.getItems().size()).append("\n");
            receipt.append("\n═══════════════════════════════════════\n");
        }

        // Iterate through all items and format each type
        List<Orderable> items = new ArrayList<>(order.getItems());
        for (Orderable item : items) {
            // Format pizza with size, crust, toppings, and sides
            if (item instanceof Pizza pizza) {
                String pizzaName = pizza.getSignaturePizzaName() != null && !pizza.getSignaturePizzaName().isEmpty() 
                    ? "⭐ " + pizza.getSignaturePizzaName() 
                    : pizza.getName();
                receipt.append("\n  🍕 [").append(itemNumber++).append("] ").append(pizzaName).append("\n");
                receipt.append("     Size: ").append(pizza.getSize()).append(" - $").append(String.format("%.2f", pizza.getBasePrice())).append("\n");
                receipt.append("     Crust: ").append(pizza.getCrust());
                if (pizza.getCrust().getExtraCost() > 0) {
                    receipt.append(String.format(" (+$%.2f)", pizza.getCrust().getExtraCost()));
                }
                receipt.append("\n     Sauce: ").append(pizza.getSauce()).append("\n");
                receipt.append("     Cheese: ").append(pizza.getCheese()).append("\n");
                Map<String, Integer> toppings = pizza.getToppingsMap();
                if (toppings.isEmpty()) {
                    receipt.append("     Toppings: None\n");
                } else {
                    receipt.append("     Toppings:\n");
                    // Apply size multiplier to topping prices
                    PizzaSize size = pizza.getSize();
                    double multiplier = size != null ? size.getToppingMultiplier() : 1.0;
                    toppings.forEach((toppingName, count) -> {
                        ToppingOption topping = com.loCxCore.menu.pizza.topping.ToppingMenu.getToppingByName(toppingName);
                        if (topping != null) {
                            double adjustedPrice = topping.getPrice() * multiplier;
                            receipt.append("       • ").append(toppingName)
                                    .append(" ($").append(String.format("%.2f", adjustedPrice));
                            if (count > 1) {
                                receipt.append(" x").append(count);
                            }
                            receipt.append(")\n");
                        }
                    });
                }
                // Display sides if any
                if (!pizza.getSides().isEmpty()) {
                    receipt.append("     Sides: ");
                    for (int i = 0; i < pizza.getSides().size(); i++) {
                        receipt.append(pizza.getSides().get(i).getName());
                        if (i < pizza.getSides().size() - 1) {
                            receipt.append(", ");
                        }
                    }
                    receipt.append("\n");
                }
                
                receipt.append("     ───────────────────\n");
                receipt.append("     Total: $").append(String.format("%.2f", pizza.calculatePrice())).append("\n");
            }
            else if (item instanceof Drink drink) {
                receipt.append("\n  🥤 [").append(itemNumber++).append("] ").append(drink.getName()).append("\n");
                receipt.append("     Size: ").append(drink.getSize()).append("\n");
                receipt.append("     Total: $").append(String.format("%.2f", drink.calculatePrice())).append("\n");
            }
            else if (item instanceof GarlicKnots garlicKnots) {
                receipt.append("\n  🧄 [").append(itemNumber++).append("] ").append(garlicKnots.getName()).append("\n");
                receipt.append("     Total: $").append(String.format("%.2f", garlicKnots.calculatePrice())).append("\n");
            }
        }

        // Calculate and display total
        double total = PriceCalculator.calculateTotal(items);
        receipt.append("\n═══════════════════════════════════════\n");
        receipt.append("  SUBTOTAL: $").append(String.format("%.2f", total)).append("\n");

        // Add cash payment details only when finalizing (includeThanks means it's checkout)
        // Web-based payment details
        if(includeThanks && cashTendered != null && cashTendered > 0) {
            receipt.append("  Cash Tendered: $").append(String.format("%.2f", cashTendered)).append("\n");
            receipt.append("  Change: $").append(String.format("%.2f", cashChange)).append("\n");
        }

        if (!notes.isEmpty()) {
            receipt.append("\n");
            notes.forEach(entry -> receipt.append("  ").append(entry).append("\n"));
        }
        
        if (includeThanks) {
            receipt.append("═══════════════════════════════════════\n");
            receipt.append("     Thank you for your order! 🍕\n");
            receipt.append("═══════════════════════════════════════\n");
        } else {
            receipt.append("═══════════════════════════════════════\n");
        }

        return receipt.toString();
    }

    // Adds a note to the receipt (e.g., payment method details)
    public void addNote(String note) {
        if (note == null || note.isBlank()) {
            return;
        }
        notes.add(note);
    }

    // Saves receipt to file in receipts directory
    public void saveToFile(String filename) {
        String content = generate(true); // Include thank you message when saving
        
        // Ensure receipts directory exists
        Path receiptsDir = Paths.get("receipts");
        try {
            if (!Files.exists(receiptsDir)) {
                Files.createDirectories(receiptsDir);
                System.out.println("Created receipts directory: " + receiptsDir.toAbsolutePath());
            }
        } catch (IOException e) {
            System.err.println("Failed to create receipts directory: " + e.getMessage());
        }
        
        // Save receipt file
        Path receiptPath = receiptsDir.resolve(filename);
        try (FileWriter writer = new FileWriter(receiptPath.toFile())) {
            writer.write(content);
            System.out.println("Receipt saved to: " + receiptPath.toAbsolutePath());
        } catch (IOException e) {
            System.err.println("Failed to save receipt to " + receiptPath.toAbsolutePath() + ": " + e.getMessage());
            e.printStackTrace();
        }
        
        // Save transaction summary to transactions.csv
        saveTransactionSummary(filename);
    }
    
    // Appends transaction summary to transactions file
    private void saveTransactionSummary(String receiptId) {
        String customerName = order.getCustomerName() != null ? order.getCustomerName() : "Guest";
        LocalDateTime now = LocalDateTime.now();
        String date = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String time = now.format(DateTimeFormatter.ofPattern("HH:mm:ss"));
        double total = PriceCalculator.calculateTotal(new ArrayList<>(order.getItems()));
        
        String transactionLine = String.format("%s|%s|%s|%s|%.2f%n", 
            receiptId, date, time, customerName, total);
        
        Path transactionsPath = Paths.get("transactions.csv");
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(transactionsPath.toFile(), true))) {
            writer.write(transactionLine);
            System.out.println("Transaction saved to: " + transactionsPath.toAbsolutePath());
        } catch (IOException e) {
            System.err.println("Failed to save transaction to " + transactionsPath.toAbsolutePath() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

}
