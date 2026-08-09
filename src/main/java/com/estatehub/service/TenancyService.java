package com.estatehub.service;

import com.estatehub.entity.Tenancy;
import com.estatehub.exception.TenancyOverlapException;
import com.estatehub.repository.TenancyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TenancyService {

    private final TenancyRepository tenancyRepository;

    @Transactional
    public Tenancy createTenancy(Tenancy tenancy) {
        if (tenancy.getRentDueDay() < 1 || tenancy.getRentDueDay() > 28) {
            throw new IllegalArgumentException("Rent due day must be between 1 and 28");
        }

        // TenancyOverlapException - new tenancy overlapping with existing active tenancy (Appendix D, HTTP 409)
        List<Tenancy> activeTenancies = tenancyRepository.findByPropertyIdAndActiveTrue(tenancy.getPropertyId());
        if (!activeTenancies.isEmpty()) {
            throw new TenancyOverlapException("An active tenancy already exists for this property");
        }

        tenancy.setActive(true);
        return tenancyRepository.save(tenancy);
    }

    @Transactional
    public Tenancy endTenancy(UUID tenancyId) {
        Tenancy tenancy = tenancyRepository.findById(tenancyId)
                .orElseThrow(() -> new com.estatehub.exception.ResourceNotFoundException("Tenancy not found"));
        tenancy.setActive(false);
        return tenancyRepository.save(tenancy);
    }
}
