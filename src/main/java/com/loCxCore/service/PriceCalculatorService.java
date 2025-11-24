package com.loCxCore.service;

import com.loCxCore.menu.MenuItem;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PriceCalculatorService {
    
    // Calculates total price by summing all item prices
    public double calculateTotal(List<MenuItem> items) {
        return items.stream()
                .mapToDouble(MenuItem::calculatePrice)
                .sum();
    }

    // Returns the calculated price for a single item
    public double calculateItemPrice(MenuItem item) {
        return item.calculatePrice();
    }
}
