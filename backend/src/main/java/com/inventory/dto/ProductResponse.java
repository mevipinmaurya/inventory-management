package com.inventory.dto;

import com.inventory.entity.Product;
import java.math.BigDecimal;

public record ProductResponse(
        Long id, String name, String category, BigDecimal price,
        int quantity, boolean active
) {
    public static ProductResponse from(Product product) {
        return new ProductResponse(product.getId(), product.getName(),
                product.getCategory(), product.getPrice(),
                product.getQuantity(), product.isActive());
    }
}
