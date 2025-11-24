package com.loCxCore.controller;

import com.loCxCore.orders.Order;
import com.loCxCore.orders.Receipt;
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
import java.time.format.DateTimeFormatter;
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
            order.setStatus("PAID");

            double totalPrice = 0.0;

            // Convert DTOs to MenuItem entities
            for (OrderItemDTO itemDTO : orderRequest.getItems()) {
                if ("pizza".equalsIgnoreCase(itemDTO.getType())) {
                    // Parse enums from strings
                    PizzaSize size = PizzaSize.valueOf(itemDTO.getSize().toUpperCase());
                    CrustType crust = CrustType.valueOf(itemDTO.getCrust().toUpperCase());
                    SauceType sauce = SauceType.valueOf(itemDTO.getSauce().toUpperCase());
                    CheeseType cheese = CheeseType.valueOf(itemDTO.getCheese().toUpperCase());

                    // Create pizza
                    Pizza pizza = new Pizza(0, size, crust, sauce, cheese);
                    
                    // Set signature pizza name if provided
                    if (itemDTO.getSignatureName() != null && !itemDTO.getSignatureName().isEmpty()) {
                        pizza.setSignaturePizzaName(itemDTO.getSignatureName());
                    }
                    
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
                    double pizzaPrice = pizza.calculatePrice();
                    pizza.setBasePrice(pizzaPrice);
                    totalPrice += pizzaPrice;
                    order.addItem(pizza);
                    
                } else if ("drink".equalsIgnoreCase(itemDTO.getType())) {
                    // Create drink
                    DrinkSize drinkSize = DrinkSize.valueOf(itemDTO.getDrinkSize().toUpperCase());
                    com.loCxCore.menu.drink.Drink drink = new com.loCxCore.menu.drink.Drink(itemDTO.getDrinkName(), drinkSize);
                    
                    double drinkPrice = drink.calculatePrice();
                    drink.setBasePrice(drinkPrice);
                    totalPrice += drinkPrice;
                    order.addItem(drink);
                    
                } else if ("garlicknots".equalsIgnoreCase(itemDTO.getType())) {
                    // Create garlic knots
                    int quantity = itemDTO.getQuantity() != null ? itemDTO.getQuantity() : 1;
                    com.loCxCore.menu.GarlicKnots garlicKnots = new com.loCxCore.menu.GarlicKnots(quantity);
                    
                    double garlicKnotsPrice = garlicKnots.calculatePrice();
                    garlicKnots.setBasePrice(garlicKnotsPrice);
                    totalPrice += garlicKnotsPrice;
                    order.addItem(garlicKnots);
                }
            }

            // Set the calculated total price
            order.setTotalPrice(totalPrice);

            Order createdOrder = orderService.createOrder(order);
            
            // Generate and save receipt with payment details
            try {
                Receipt receipt;
                if (orderRequest.getCashTendered() != null && orderRequest.getCashChange() != null) {
                    receipt = new Receipt(createdOrder, orderRequest.getCashTendered(), orderRequest.getCashChange());
                } else {
                    receipt = new Receipt(createdOrder);
                }
                // Receipt ID format: {orderId}-yyyyMMdd-HHmmss (e.g., 123-20251119-143025)
                String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
                String receiptId = createdOrder.getId() + "-" + timestamp;
                receipt.saveToFile(receiptId);
            } catch (Exception receiptError) {
                System.err.println("Failed to save receipt: " + receiptError.getMessage());
                receiptError.printStackTrace();
                // Continue even if receipt fails - order is already saved
            }
            
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
