package com.loCxCore.controller;

import com.loCxCore.orders.Order;
import com.loCxCore.service.OrderService;
import com.loCxCore.dto.OrderRequestDTO;
import com.loCxCore.dto.OrderItemDTO;
import com.loCxCore.menu.pizza.Pizza;
import com.loCxCore.core.enums.*;
import com.loCxCore.menu.pizza.topping.ToppingOption;
import com.loCxCore.menu.pizza.topping.ToppingMenu;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequestDTO orderRequest) {
        try {
            // Create the order
            Order order = new Order();
            order.setCustomerName(orderRequest.getCustomerName());
            order.setOrderDate(LocalDateTime.now());
            order.setTotalPrice(Double.parseDouble(orderRequest.getTotalPrice()));
            order.setStatus("PENDING");

            // Convert DTOs to Pizza entities
            for (OrderItemDTO itemDTO : orderRequest.getItems()) {
                if ("pizza".equalsIgnoreCase(itemDTO.getType())) {
                    // Parse enums from strings
                    PizzaSize size = PizzaSize.valueOf(itemDTO.getSize().toUpperCase());
                    CrustType crust = CrustType.valueOf(itemDTO.getCrust().toUpperCase());
                    SauceType sauce = SauceType.valueOf(itemDTO.getSauce().toUpperCase());
                    CheeseType cheese = CheeseType.valueOf(itemDTO.getCheese().toUpperCase());

                    // Create pizza
                    Pizza pizza = new Pizza(0, size, crust, sauce, cheese);
                    
                    // Add toppings
                    if (itemDTO.getToppings() != null) {
                        for (String toppingName : itemDTO.getToppings()) {
                            ToppingOption topping = ToppingMenu.getToppingByName(toppingName);
                            if (topping != null) {
                                pizza.add(topping);
                            } else {
                                System.err.println("Unknown topping: " + toppingName);
                            }
                        }
                    }
                    
                    // Calculate and set the price
                    pizza.setBasePrice(pizza.calculatePrice());
                    order.addItem(pizza);
                }
            }

            Order createdOrder = orderService.createOrder(order);
            return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error creating order: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        try {
            List<Order> orders = orderService.getAllOrders();
            System.out.println("Fetched " + orders.size() + " orders");
            return new ResponseEntity<>(orders, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error fetching orders: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Optional<Order> order = orderService.getOrderById(id);
        return order.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/customer/{customerName}")
    public ResponseEntity<List<Order>> getOrdersByCustomer(@PathVariable String customerName) {
        try {
            List<Order> orders = orderService.getOrdersByCustomerName(customerName);
            return new ResponseEntity<>(orders, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestBody String status) {
        Order updatedOrder = orderService.updateOrderStatus(id, status);
        if (updatedOrder != null) {
            return new ResponseEntity<>(updatedOrder, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
