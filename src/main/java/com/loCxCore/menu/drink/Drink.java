package com.loCxCore.menu.drink;

import com.loCxCore.core.enums.DrinkSize;
import com.loCxCore.menu.MenuItem;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@DiscriminatorValue("DRINK")
public class Drink extends MenuItem {

    @Enumerated(EnumType.STRING)
    @Column(name = "drink_size")
    private DrinkSize size;

    @Column(name = "drink_name")
    private String drinkName;

    public Drink() {
        super();
    }

    public Drink(String drinkName, DrinkSize size) {
        super(drinkName, size.getPrice());
        this.drinkName = drinkName;
        this.size = size;
    }

    @JsonProperty("size")
    public DrinkSize getSize() {
        return size;
    }

    public void setSize(DrinkSize size) {
        this.size = size;
        if (size != null) {
            setBasePrice(size.getPrice());
        }
    }

    @JsonProperty("drinkName")
    public String getDrinkName() {
        return drinkName;
    }

    public void setDrinkName(String drinkName) {
        this.drinkName = drinkName;
        setName(drinkName);
    }

    @Override
    public double calculatePrice() {
        return size != null ? size.getPrice() : 0.0;
    }

    @JsonProperty("itemType")
    public String getItemType() {
        return "DRINK";
    }
}
