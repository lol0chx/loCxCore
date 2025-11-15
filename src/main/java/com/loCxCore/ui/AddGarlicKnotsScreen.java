package com.loCxCore.ui;

import com.loCxCore.menu.GarlicKnots;
import com.loCxCore.orders.Order;
import com.loCxCore.services.InputHandler;

public class AddGarlicKnotsScreen {
    private final Order order;

    public AddGarlicKnotsScreen(Order order) {
        this.order = order;
    }

    // Prompts user to add garlic knots to their order
    public void start() {
        System.out.println("\n--- Garlic Knots ($5.00) ---");
        int confirm = InputHandler.getIntInput("Add Garlic Knots to order? 1. Yes  2. No\n", 1, 2);
        
        if (confirm == 1) {
            GarlicKnots garlicKnots = new GarlicKnots();
            order.addItem(garlicKnots);
            System.out.println("✅ Garlic Knots added to order!");
        }
    }
}
