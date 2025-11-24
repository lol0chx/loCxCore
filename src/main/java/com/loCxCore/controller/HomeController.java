package com.loCxCore.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/")
public class HomeController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> home() {
        Map<String, Object> response = new HashMap<>();
        response.put("application", "PizzaPoint API");
        response.put("version", "1.0");
        response.put("status", "running");
        
        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("orders", "/api/orders");
        endpoints.put("menu", "/api/menu");
        endpoints.put("h2-console", "/h2-console");
        
        response.put("endpoints", endpoints);
        response.put("message", "Welcome to PizzaPoint API! Use the endpoints above to interact with the service.");
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
