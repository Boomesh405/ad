package com.estatehub.dto;

import com.estatehub.entity.enums.ListingType;
import com.estatehub.entity.enums.PossessionStatus;
import com.estatehub.entity.enums.PropertyType;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PropertySearchCriteria {
    private String keyword;
    private PropertyType propertyType;
    private String bhkConfig;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Double minCarpetArea;
    private Double maxCarpetArea;
    private ListingType listingType;
    private PossessionStatus possessionStatus;
    private String city;
    private String pincode;
    private String sortBy; // PRICE_ASC, PRICE_DESC, DATE, AREA
    private int page = 0;
    private int size = 20;
}
