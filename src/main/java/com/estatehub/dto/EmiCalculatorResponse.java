package com.estatehub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmiCalculatorResponse {
    private BigDecimal loanAmount;
    private BigDecimal monthlyEmi;
    private BigDecimal totalInterestPayable;
    private BigDecimal totalPayment;
    private List<AmortisationRow> amortisationSchedule;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AmortisationRow {
        private int month;
        private BigDecimal principalComponent;
        private BigDecimal interestComponent;
        private BigDecimal remainingBalance;
    }
}
