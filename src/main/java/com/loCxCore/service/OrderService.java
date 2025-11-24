package com.loCxCore.service;

import com.loCxCore.orders.Order;
import com.loCxCore.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PriceCalculatorService priceCalculatorService;

    public Order createOrder(Order order) {
        double total = priceCalculatorService.calculateTotal(order.getItems());
        order.setTotalPrice(total);
        order.setOrderDate(LocalDateTime.now());
        
        // Calculate daily order number
        int dailyOrderNumber = getDailyOrderNumber();
        order.setDailyOrderNumber(dailyOrderNumber);
        
        // Status is set by controller
        return orderRepository.save(order);
    }
    
    private int getDailyOrderNumber() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        
        // Count orders created today
        List<Order> todaysOrders = orderRepository.findAll().stream()
            .filter(order -> {
                LocalDateTime orderDate = order.getOrderDate();
                return orderDate != null && 
                       orderDate.isAfter(startOfDay) && 
                       orderDate.isBefore(endOfDay);
            })
            .toList();
        
        // Return next order number for today
        return todaysOrders.size() + 1;
    }

    public List<Order> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        
        // Update any PENDING orders to PAID and assign daily order numbers to legacy orders
        orders.forEach(order -> {
            boolean needsSave = false;
            
            if ("PENDING".equals(order.getStatus())) {
                order.setStatus("PAID");
                needsSave = true;
            }
            
            // Assign daily order number if missing
            if (order.getDailyOrderNumber() == null && order.getOrderDate() != null) {
                LocalDate orderDate = order.getOrderDate().toLocalDate();
                LocalDateTime startOfDay = orderDate.atStartOfDay();
                LocalDateTime endOfDay = orderDate.atTime(LocalTime.MAX);
                
                // Count orders on the same day that came before this one
                long orderNumber = orders.stream()
                    .filter(o -> o.getOrderDate() != null)
                    .filter(o -> {
                        LocalDateTime oDate = o.getOrderDate();
                        return oDate.isAfter(startOfDay) && oDate.isBefore(endOfDay);
                    })
                    .filter(o -> o.getOrderDate().isBefore(order.getOrderDate()) || 
                               (o.getOrderDate().equals(order.getOrderDate()) && o.getId() <= order.getId()))
                    .count();
                
                order.setDailyOrderNumber((int) orderNumber);
                needsSave = true;
            }
            
            if (needsSave) {
                orderRepository.save(order);
            }
        });
        
        return orders;
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public List<Order> getOrdersByCustomerName(String customerName) {
        return orderRepository.findByCustomerName(customerName);
    }

    public Order updateOrderStatus(Long id, String status) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus(status);
            return orderRepository.save(order);
        }
        return null;
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}
