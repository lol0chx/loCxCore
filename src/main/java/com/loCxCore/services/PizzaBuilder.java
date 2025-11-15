package com.loCxCore.services;

import com.loCxCore.core.enums.CheeseType;
import com.loCxCore.core.enums.CrustType;
import com.loCxCore.core.enums.PizzaSize;
import com.loCxCore.core.enums.SauceType;
import com.loCxCore.menu.pizza.Pizza;

public class PizzaBuilder {
    private final Pizza pizza;

    // Initializes pizza with base attributes for building
    public PizzaBuilder(double basePrice, PizzaSize size, CrustType crust, SauceType sauce, CheeseType cheese) {
        pizza = new Pizza(basePrice, size, crust, sauce, cheese);
    }

    public PizzaBuilder setSize(PizzaSize size) {
        pizza.setSize(size);
        return this;
    }

    public PizzaBuilder setCrust(CrustType crust) {
        pizza.setCrust(crust);
        return this;
    }

    public Pizza build() {

        return pizza;
    }
}

