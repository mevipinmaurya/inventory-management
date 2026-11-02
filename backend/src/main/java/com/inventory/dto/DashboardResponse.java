package com.inventory.dto;

import java.math.BigDecimal;

public record DashboardResponse(
        long totalProducts,
        long totalOrders,
        long lowStockProducts,
        BigDecimal totalSales
) {}
