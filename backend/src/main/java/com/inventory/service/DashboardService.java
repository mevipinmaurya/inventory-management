package com.inventory.service;

import com.inventory.dto.DashboardResponse;
import com.inventory.entity.OrderStatus;
import com.inventory.repository.OrderRepository;
import com.inventory.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class DashboardService {
    private static final int LOW_STOCK_THRESHOLD = 5;

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public DashboardService(ProductRepository productRepository, OrderRepository orderRepository) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    public DashboardResponse getSummary() {
        long products = productRepository.countByActiveTrue();
        long orders = orderRepository.count();
        long lowStock = productRepository.countByActiveTrueAndQuantityLessThanEqual(LOW_STOCK_THRESHOLD);
        BigDecimal sales = orderRepository.sumTotalByStatus(OrderStatus.COMPLETED);
        return new DashboardResponse(products, orders, lowStock, sales == null ? BigDecimal.ZERO : sales);
    }
}
