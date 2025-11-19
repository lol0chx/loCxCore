package com.loCxCore.menu.pizza;

import com.loCxCore.services.Customization;
import com.loCxCore.core.enums.CheeseType;
import com.loCxCore.core.enums.CrustType;
import com.loCxCore.core.enums.PizzaSize;
import com.loCxCore.core.enums.SauceType;
import com.loCxCore.core.interfaces.Customizable;
import com.loCxCore.menu.MenuItem;
import com.loCxCore.menu.pizza.side.Side;
import com.loCxCore.menu.pizza.topping.ToppingOption;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Entity;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Transient;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@DiscriminatorValue("PIZZA")
public class Pizza extends MenuItem implements Customizable<ToppingOption> {

    @Transient
    @JsonIgnore
    private final Customization<ToppingOption> toppings = new Customization<>();
    
    @Transient
    @JsonIgnore
    private final Customization<PizzaSize> size = new Customization<>(true);
    
    @Transient
    @JsonIgnore
    private final Customization<CrustType> crust = new Customization<>(true);
    
    @Transient
    @JsonIgnore
    private final Customization<CheeseType> cheese = new Customization<>(true);
    
    @Transient
    @JsonIgnore
    private final Customization<SauceType> sauce = new Customization<>(true);
    
    @Transient
    @JsonIgnore
    private final List<Side> sides = new ArrayList<>();

    // Default constructor for JPA
    public Pizza() {
        super();
    }

    //all pizza should start with name price and inttialsize and crust
    public Pizza(double price, PizzaSize initialSize, CrustType initialCrust, SauceType initialSauce, CheeseType initialCheese ) {
        this("Custom Pizza ", price, initialSize, initialCrust, initialSauce, initialCheese);
    }
    //for preset pizza
    public Pizza(String name, double price, PizzaSize initialSize, CrustType initialCrust, SauceType initialSauce, CheeseType initialCheese ) {
        super(name, price);
        size.add(initialSize);
        crust.add(initialCrust);
        sauce.add(initialSauce);
        cheese.add(initialCheese);
    }

    // Replaces current sauce with new selection
    public void setSauce(SauceType sauce) {
        this.sauce.clear();
        this.sauce.add(sauce);
    }
    
    @JsonProperty("sauce")
    public SauceType getSauce() {
        return this.sauce.getAll().keySet().stream().findFirst().orElse(null);
    }

    // Replaces current cheese with new selection
    public void setCheese(CheeseType cheese) {
        this.cheese.clear();
        this.cheese.add(cheese);
    }
    
    @JsonProperty("cheese")
    public CheeseType getCheese() {
        return this.cheese.getAll().keySet().stream().findFirst().orElse(null);
    }

    //clears old size because we can only have one size and crust
    public void setSize(PizzaSize newSize) {
        size.clear();
        size.add(newSize);
    }
    
    public void setCrust(CrustType newCrust) {
        crust.clear();
        crust.add(newCrust);
    }
    
    @JsonProperty("crust")
    public CrustType getCrust() {
        return crust.getAll().keySet().stream().findFirst().orElse(null);
    }
    
    @JsonProperty("size")
    public PizzaSize getSize() {
        return size.getAll().keySet().stream().findFirst().orElse(null);
    }

    // Returns unmodifiable topping map for receipt display
    @JsonProperty("toppingsMap")
    public Map<ToppingOption, Integer> getToppingsMap() {
        return toppings.getAll();
    }
    
    // Returns mutable customization object for price calculation
    @JsonIgnore
    public Customization<ToppingOption> getToppings() {
        return toppings;
    }
    
    public void addSide(Side side) {
        sides.add(side);
    }
    
    public List<Side> getSides() {
        return sides;
    }
    @Override
    public void add(ToppingOption topping) {
        toppings.add(topping);
    }
    @Override
    public void remove(ToppingOption topping) {
        toppings.remove(topping);
    }
    @Override
    public String displayCustomization() {
        PizzaSize currentSize = getSize();

        return "🍕 Pizza Customization:\n" +
                " - Size: " + size.display() + "\n" +
                " - Crust: " + crust.display() + "\n" +
                " - Toppings: " + toppings.display()  + getToppingMultiplier(currentSize);
    }

    // Calculates total price: base + crust + toppings with size multipliers
    @Override
    public double calculatePrice() {
        double price = 0.0;
        PizzaSize currentSize = getSize();
        CrustType currentCrust = getCrust();
        if (currentSize != null) {
            price += currentSize.getBasePrice();
        }
        if (currentCrust != null) {
            // Apply size multiplier to crust extra cost (stuffed crust scales with size)
            double multiplier = getToppingMultiplier(currentSize);
            price += currentCrust.getExtraCost() * multiplier;
        }
        for (Map.Entry<ToppingOption, Integer> entry : getToppingsMap().entrySet()) {
            double toppingBase = entry.getKey().getPrice();
            double multiplier = getToppingMultiplier(currentSize);
            price += toppingBase * multiplier * entry.getValue();
        }
        return price;
    }

    // Returns price multiplier based on pizza size
    private double getToppingMultiplier(PizzaSize size) {
        if (size == null) {
            return 1.0;
        }
        return switch (size) {
            case SMALL -> 1.0;
            case MEDIUM -> 1.5;
            case LARGE -> 2.0;
        };
    }
}
