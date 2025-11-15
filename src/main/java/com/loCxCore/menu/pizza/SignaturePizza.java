package com.loCxCore.menu.pizza;

import com.loCxCore.core.enums.*;
import com.loCxCore.menu.pizza.topping.ToppingMenu;
import com.loCxCore.menu.pizza.topping.ToppingOption;
import com.loCxCore.menu.pizza.topping.ToppingSelector;

import java.util.List;

public class SignaturePizza extends Pizza {
    private final String description;
    
    public SignaturePizza(String name, String description, PizzaSize size, 
                          CrustType crust, SauceType sauce, CheeseType cheese,
                          List<String> defaultToppingNames) {
        super(name, size.getBasePrice(), size, crust, sauce, cheese);
        this.description = description;
        
        // Add default toppings
        ToppingSelector selector = new ToppingSelector(this);
        for (String toppingName : defaultToppingNames) {
            ToppingOption topping = ToppingMenu.getAllToppings().get(toppingName);
            if (topping != null) {
                selector.addTopping(topping);
            }
        }
    }
    
    public String getDescription() {
        return description;
    }
}
