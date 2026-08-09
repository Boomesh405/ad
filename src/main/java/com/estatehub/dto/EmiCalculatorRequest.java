package com.estatehub.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class EmiCalculatorRequest {
    @NotNull @Positive
    private BigDecimal propertyPrice;

    @NotNull
    private BigDecimal downPayment;

    @NotNull @Positive
    private BigDecimal annualInterestRatePercent;

    @NotNull @Positive
    private Integer tenureYears;
}
