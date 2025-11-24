package com.loCxCore.controller;

import com.loCxCore.core.enums.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class MenuController {

    @GetMapping("/pizza-sizes")
    public ResponseEntity<Map<String, Object>[]> getPizzaSizes() {
        PizzaSize[] sizes = PizzaSize.values();
        Map<String, Object>[] result = new Map[sizes.length];
        
        for (int i = 0; i < sizes.length; i++) {
            Map<String, Object> sizeMap = new HashMap<>();
            sizeMap.put("name", sizes[i].name());
            sizeMap.put("price", sizes[i].getBasePrice());
            result[i] = sizeMap;
        }
        
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/crust-types")
    public ResponseEntity<Map<String, Object>[]> getCrustTypes() {
        CrustType[] crusts = CrustType.values();
        Map<String, Object>[] result = new Map[crusts.length];
        
        for (int i = 0; i < crusts.length; i++) {
            Map<String, Object> crustMap = new HashMap<>();
            crustMap.put("name", crusts[i].name());
            crustMap.put("extraCost", crusts[i].getExtraCost());
            result[i] = crustMap;
        }
        
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/cheese-types")
    public ResponseEntity<String[]> getCheeseTypes() {
        CheeseType[] cheeses = CheeseType.values();
        String[] result = new String[cheeses.length];
        
        for (int i = 0; i < cheeses.length; i++) {
            result[i] = cheeses[i].name();
        }
        
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/sauce-types")
    public ResponseEntity<String[]> getSauceTypes() {
        SauceType[] sauces = SauceType.values();
        String[] result = new String[sauces.length];
        
        for (int i = 0; i < sauces.length; i++) {
            result[i] = sauces[i].name();
        }
        
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/drink-sizes")
    public ResponseEntity<Map<String, Object>[]> getDrinkSizes() {
        DrinkSize[] sizes = DrinkSize.values();
        Map<String, Object>[] result = new Map[sizes.length];
        
        for (int i = 0; i < sizes.length; i++) {
            Map<String, Object> sizeMap = new HashMap<>();
            sizeMap.put("name", sizes[i].name());
            sizeMap.put("price", sizes[i].getPrice());
            result[i] = sizeMap;
        }
        
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}
