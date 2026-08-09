package com.estatehub.service;

import com.estatehub.entity.RentInvoice;
import com.estatehub.entity.Tenancy;
import com.estatehub.entity.enums.InvoiceStatus;
import com.estatehub.repository.RentInvoiceRepository;
import com.estatehub.repository.TenancyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Rent invoicing and TDS/late-fee computation (SRS FR7).
 * generateMonthlyInvoices() is intended to run as a scheduled job on each tenancy's due date.
 */
@Service
@RequiredArgsConstructor
public class RentInvoiceService {

    @Value("${platform.tds-threshold-monthly-rent}")
    private BigDecimal tdsThreshold;

    @Value("${platform.tds-rate-percent}")
    private BigDecimal tdsRatePercent;

    private final RentInvoiceRepository rentInvoiceRepository;
    private final TenancyRepository tenancyRepository;

    @Transactional
    public RentInvoice generateInvoice(UUID tenancyId, LocalDate invoiceDate) {
        Tenancy tenancy = tenancyRepository.findById(tenancyId)
                .orElseThrow(() -> new com.estatehub.exception.ResourceNotFoundException("Tenancy not found"));

        LocalDate dueDate = invoiceDate.withDayOfMonth(
                Math.min(tenancy.getRentDueDay(), invoiceDate.lengthOfMonth()));

        boolean tdsApplicable = tenancy.getMonthlyRent().compareTo(tdsThreshold) > 0;
        BigDecimal tdsAmount = tdsApplicable
                ? tenancy.getMonthlyRent().multiply(tdsRatePercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        RentInvoice invoice = RentInvoice.builder()
                .tenancyId(tenancyId)
                .invoiceDate(invoiceDate)
                .dueDate(dueDate)
                .amount(tenancy.getMonthlyRent())
                .tdsApplicable(tdsApplicable)
                .tdsAmount(tdsAmount)
                .status(InvoiceStatus.PENDING)
                .build();

        return rentInvoiceRepository.save(invoice);
    }

    @Transactional
    public RentInvoice applyLateFee(UUID invoiceId) {
        RentInvoice invoice = rentInvoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new com.estatehub.exception.ResourceNotFoundException("Invoice not found"));

        Tenancy tenancy = tenancyRepository.findById(invoice.getTenancyId())
                .orElseThrow(() -> new com.estatehub.exception.ResourceNotFoundException("Tenancy not found"));

        int gracePeriod = tenancy.getGracePeriodDays() != null ? tenancy.getGracePeriodDays() : 5;
        LocalDate lateFeeStartsOn = invoice.getDueDate().plusDays(gracePeriod);

        if (invoice.getStatus() == InvoiceStatus.PENDING && LocalDate.now().isAfter(lateFeeStartsOn)) {
            BigDecimal lateFee = tenancy.getLateFeeFlat() != null
                    ? tenancy.getLateFeeFlat()
                    : (tenancy.getLateFeePercent() != null
                        ? invoice.getAmount().multiply(tenancy.getLateFeePercent()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO);

            invoice.setLateFeeApplied(lateFee);
            invoice.setStatus(InvoiceStatus.LATE_FEE_APPLIED);
            rentInvoiceRepository.save(invoice);
        }
        return invoice;
    }

    @Transactional
    public RentInvoice markPaid(UUID invoiceId) {
        RentInvoice invoice = rentInvoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new com.estatehub.exception.ResourceNotFoundException("Invoice not found"));
        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaidAt(java.time.LocalDateTime.now());
        return rentInvoiceRepository.save(invoice);
    }

    @Transactional(readOnly = true)
    public List<RentInvoice> getLedger(UUID tenancyId) {
        return rentInvoiceRepository.findByTenancyIdOrderByInvoiceDateDesc(tenancyId);
    }
}
