package com.estatehub.entity;

import com.estatehub.entity.enums.InvoiceStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rent_invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "invoice_id", updatable = false, nullable = false)
    private UUID invoiceId;

    @Column(name = "tenancy_id", nullable = false)
    private UUID tenancyId;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "gst_amount", precision = 10, scale = 2)
    private BigDecimal gstAmount;

    // TDS auto-highlighted when monthly rent > Rs.50,000 (Section 194-IB)
    @Column(name = "tds_applicable")
    @Builder.Default
    private boolean tdsApplicable = false;

    @Column(name = "tds_amount", precision = 10, scale = 2)
    private BigDecimal tdsAmount;

    @Column(name = "late_fee_applied", precision = 8, scale = 2)
    private BigDecimal lateFeeApplied;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private InvoiceStatus status = InvoiceStatus.PENDING;

    @Column(name = "razorpay_payment_link", length = 500)
    private String razorpayPaymentLink;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
