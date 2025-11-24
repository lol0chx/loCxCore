package com.loCxCore.dto;

import java.util.List;

public class OrderRequest {
    private String customerName;
    private List<PizzaRequest> pizzas;
    private List<DrinkRequest> drinks;
    private List<GarlicKnotsRequest> garlicKnots;

    public OrderRequest() {
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public List<PizzaRequest> getPizzas() {
        return pizzas;
    }

    public void setPizzas(List<PizzaRequest> pizzas) {
        this.pizzas = pizzas;
    }

    public List<DrinkRequest> getDrinks() {
        return drinks;
    }

    public void setDrinks(List<DrinkRequest> drinks) {
        this.drinks = drinks;
    }

    public List<GarlicKnotsRequest> getGarlicKnots() {
        return garlicKnots;
    }

    public void setGarlicKnots(List<GarlicKnotsRequest> garlicKnots) {
        this.garlicKnots = garlicKnots;
    }
}
