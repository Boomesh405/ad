package com.estatehub.repository;

import com.estatehub.entity.Enquiry;
import com.estatehub.entity.enums.LeadStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EnquiryRepository extends JpaRepository<Enquiry, UUID> {
    List<Enquiry> findByAgentId(UUID agentId);
    List<Enquiry> findByAgentIdAndStage(UUID agentId, LeadStage stage);
    List<Enquiry> findByPropertyId(UUID propertyId);
    long countByBuyerMobileAndCreatedAtAfter(String buyerMobile, LocalDateTime after);
}
