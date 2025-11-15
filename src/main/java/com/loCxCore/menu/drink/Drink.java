package com.loCxCore.menu.drink;

import com.loCxCore.core.enums.DrinkSize;
import com.loCxCore.menu.MenuItem;

public class Drink extends MenuItem {


    private final DrinkSize size;

    public Drink(String name, DrinkSize size) {
        super(name, size.getPrice());
        this.size = size;
    }
    public DrinkSize getSize() {
        return size;
    }

    @Override
    public double calculatePrice() {

        return size.getPrice();
    }
}
