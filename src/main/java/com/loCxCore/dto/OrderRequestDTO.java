package com.loCxCore.dto;

import java.util.List;

public class OrderRequestDTO {
    private String customerName;
    private List<OrderItemDTO> items;
    private String totalPrice;
    private String orderDate;
    private Double cashTendered;
    private Double cashChange;

    public OrderRequestDTO() {
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public List<OrderItemDTO> getItems() {
        return items;
    }

    public void setItems(List<OrderItemDTO> items) {
        this.items = items;
    }

    public String getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(String totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(String orderDate) {
        this.orderDate = orderDate;
    }

    public Double getCashTendered() {
        return cashTendered;
    }

    public void setCashTendered(Double cashTendered) {
        this.cashTendered = cashTendered;
    }

    public Double getCashChange() {
        return cashChange;
    }

    public void setCashChange(Double cashChange) {
        this.cashChange = cashChange;
    }
}

