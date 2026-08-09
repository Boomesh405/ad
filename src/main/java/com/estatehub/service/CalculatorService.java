package com.estatehub.service;

import com.estatehub.dto.EmiCalculatorRequest;
import com.estatehub.dto.EmiCalculatorResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * EMI, ROI, and stamp-duty calculators (SRS FR10). Financial calculators only;
 * no data persistence needed.
 */
@Service
public class CalculatorService {

    public EmiCalculatorResponse calculateEmi(EmiCalculatorRequest req) {
        BigDecimal loanAmount = req.getPropertyPrice().subtract(req.getDownPayment());
        BigDecimal monthlyRate = req.getAnnualInterestRatePercent()
                .divide(BigDecimal.valueOf(1200), 10, RoundingMode.HALF_UP);
        int months = req.getTenureYears() * 12;

        BigDecimal onePlusR = BigDecimal.ONE.add(monthlyRate);
        BigDecimal onePlusRPowN = onePlusR.pow(months);

        BigDecimal numerator = loanAmount.multiply(monthlyRate).multiply(onePlusRPowN);
        BigDecimal denominator = onePlusRPowN.subtract(BigDecimal.ONE);
        BigDecimal emi = denominator.compareTo(BigDecimal.ZERO) == 0
                ? loanAmount.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP)
                : numerator.divide(denominator, 2, RoundingMode.HALF_UP);

        List<EmiCalculatorResponse.AmortisationRow> schedule = new ArrayList<>();
        BigDecimal balance = loanAmount;
        BigDecimal totalInterest = BigDecimal.ZERO;

        for (int m = 1; m <= months; m++) {
            BigDecimal interestComponent = balance.multiply(monthlyRate).setScale(2, RoundingMode.HALF_UP);
            BigDecimal principalComponent = emi.subtract(interestComponent).setScale(2, RoundingMode.HALF_UP);
            balance = balance.subtract(principalComponent).max(BigDecimal.ZERO);
            totalInterest = totalInterest.add(interestComponent);

            schedule.add(EmiCalculatorResponse.AmortisationRow.builder()
                    .month(m)
                    .principalComponent(principalComponent)
                    .interestComponent(interestComponent)
                    .remainingBalance(balance)
                    .build());
        }

        return EmiCalculatorResponse.builder()
                .loanAmount(loanAmount)
                .monthlyEmi(emi)
                .totalInterestPayable(totalInterest.setScale(2, RoundingMode.HALF_UP))
                .totalPayment(loanAmount.add(totalInterest).setScale(2, RoundingMode.HALF_UP))
                .amortisationSchedule(schedule)
                .build();
    }

    public BigDecimal calculateRentalYield(BigDecimal annualRent, BigDecimal propertyPrice) {
        return annualRent.divide(propertyPrice, 6, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateRoi(BigDecimal purchasePrice, BigDecimal annualRent, BigDecimal vacancyPercent) {
        BigDecimal effectiveRent = annualRent.multiply(
                BigDecimal.ONE.subtract(vacancyPercent.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP)));
        return effectiveRent.divide(purchasePrice, 6, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }
}
