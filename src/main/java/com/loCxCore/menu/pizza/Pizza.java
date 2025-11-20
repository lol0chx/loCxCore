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

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Entity
@DiscriminatorValue("PIZZA")
public class Pizza extends MenuItem implements Customizable<ToppingOption> {

    // Persistent fields for database storage
    @Enumerated(EnumType.STRING)
    private PizzaSize pizzaSize;
    
    @Enumerated(EnumType.STRING)
    private CrustType crustType;
    
    @Enumerated(EnumType.STRING)
    private SauceType sauceType;
    
    @Enumerated(EnumType.STRING)
    private CheeseType cheeseType;
    
    private String signaturePizzaName;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "pizza_toppings", joinColumns = @JoinColumn(name = "pizza_id"))
    @MapKeyColumn(name = "topping_name")
    @Column(name = "quantity")
    private Map<String, Integer> toppingQuantities = new HashMap<>();

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
        // Also set persistent fields
        this.pizzaSize = initialSize;
        this.crustType = initialCrust;
        this.sauceType = initialSauce;
        this.cheeseType = initialCheese;
    }

    // Replaces current sauce with new selection
    public void setSauce(SauceType sauce) {
        this.sauce.clear();
        this.sauce.add(sauce);
        this.sauceType = sauce;
    }
    
    @JsonProperty("sauce")
    public SauceType getSauce() {
        return this.sauceType;
    }

    // Replaces current cheese with new selection
    public void setCheese(CheeseType cheese) {
        this.cheese.clear();
        this.cheese.add(cheese);
        this.cheeseType = cheese;
    }
    
    @JsonProperty("cheese")
    public CheeseType getCheese() {
        return this.cheeseType;
    }

    //clears old size because we can only have one size and crust
    public void setSize(PizzaSize newSize) {
        size.clear();
        size.add(newSize);
        this.pizzaSize = newSize;
    }
    
    public void setCrust(CrustType newCrust) {
        crust.clear();
        crust.add(newCrust);
        this.crustType = newCrust;
    }
    
    @JsonProperty("crust")
    public CrustType getCrust() {
        return this.crustType;
    }
    
    @JsonProperty("size")
    public PizzaSize getSize() {
        return this.pizzaSize;
    }
    
    @JsonProperty("signatureName")
    public String getSignaturePizzaName() {
        return this.signaturePizzaName;
    }
    
    public void setSignaturePizzaName(String name) {
        this.signaturePizzaName = name;
    }

    // Returns unmodifiable topping map for receipt display
    @JsonProperty("toppingsMap")
    public Map<String, Integer> getToppingsMap() {
        return toppingQuantities;
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
        // Update persistent map
        String toppingName = topping.getName();
        toppingQuantities.put(toppingName, toppingQuantities.getOrDefault(toppingName, 0) + 1);
    }
    @Override
    public void remove(ToppingOption topping) {
        toppings.remove(topping);
        // Update persistent map
        String toppingName = topping.getName();
        if (toppingQuantities.containsKey(toppingName)) {
            int count = toppingQuantities.get(toppingName);
            if (count <= 1) {
                toppingQuantities.remove(toppingName);
            } else {
                toppingQuantities.put(toppingName, count - 1);
            }
        }
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
        // Use the Customization object for price calculation
        for (Map.Entry<ToppingOption, Integer> entry : getToppings().getAll().entrySet()) {
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
