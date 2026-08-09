package com.estatehub.controller;

import com.estatehub.dto.EmiCalculatorRequest;
import com.estatehub.dto.EmiCalculatorResponse;
import com.estatehub.service.CalculatorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

// FR10: Financial Calculators - Public
@RestController
@RequestMapping("/api/v1/calculators")
@RequiredArgsConstructor
public class CalculatorController {

    private final CalculatorService calculatorService;

    @PostMapping("/emi")
    public ResponseEntity<EmiCalculatorResponse> emi(@Valid @RequestBody EmiCalculatorRequest request) {
        return ResponseEntity.ok(calculatorService.calculateEmi(request));
    }

    @GetMapping("/rental-yield")
    public ResponseEntity<BigDecimal> rentalYield(@RequestParam BigDecimal annualRent,
                                                    @RequestParam BigDecimal propertyPrice) {
        return ResponseEntity.ok(calculatorService.calculateRentalYield(annualRent, propertyPrice));
    }

    @GetMapping("/roi")
    public ResponseEntity<BigDecimal> roi(@RequestParam BigDecimal purchasePrice,
                                           @RequestParam BigDecimal annualRent,
                                           @RequestParam BigDecimal vacancyPercent) {
        return ResponseEntity.ok(calculatorService.calculateRoi(purchasePrice, annualRent, vacancyPercent));
    }
}
