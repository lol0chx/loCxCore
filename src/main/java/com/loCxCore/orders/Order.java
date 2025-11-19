package com.loCxCore.orders;

import com.loCxCore.menu.MenuItem;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_name")
    private String customerName;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @JoinColumn(name = "order_id")
    private List<MenuItem> items = new ArrayList<>();

    @Column(name = "order_date")
    private LocalDateTime orderDate;

    @Column(name = "total_price")
    private double totalPrice;

    @Column(name = "status")
    private String status = "PENDING";

    @Column(name = "daily_order_number")
    private Integer dailyOrderNumber;

    public Order() {
        this.orderDate = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getDailyOrderNumber() {
        return dailyOrderNumber;
    }

    public void setDailyOrderNumber(Integer dailyOrderNumber) {
        this.dailyOrderNumber = dailyOrderNumber;
    }

    // Adds a new item to the order
    public void addItem(MenuItem item) {
        items.add(item);
    }

    // Removes an item from the order
    public void removeItem(MenuItem item) {
        items.remove(item);
    }

    // Returns all items in the order
    public List<MenuItem> getItems() {
        return items;
    }

    public void setItems(List<MenuItem> items) {
        this.items = items;
    }

     // Clears all items from the order
    public void clear() {
        items.clear();
    }
}
