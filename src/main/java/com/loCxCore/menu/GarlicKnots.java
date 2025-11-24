package com.loCxCore.menu;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@DiscriminatorValue("GARLIC_KNOTS")
public class GarlicKnots extends MenuItem {
    private static final double FIXED_PRICE = 5.00;

    @Column(name = "quantity")
    private int quantity = 1;

    public GarlicKnots() {
        super("Garlic Knots", FIXED_PRICE);
    }

    public GarlicKnots(int quantity) {
        super("Garlic Knots", FIXED_PRICE);
        this.quantity = quantity;
    }

    @JsonProperty("quantity")
    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    @Override
    public double calculatePrice() {
        return FIXED_PRICE * quantity;
    }

    @Override
    public String toString() {
        return String.format("%s (x%d) - $%.2f", getName(), quantity, calculatePrice());
    }

    @JsonProperty("itemType")
    public String getItemType() {
        return "GARLIC_KNOTS";
    }
}
