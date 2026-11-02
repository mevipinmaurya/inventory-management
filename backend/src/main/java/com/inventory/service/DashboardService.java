package com.inventory.service;

import com.inventory.auth.CurrentUserService;
import com.inventory.dto.DashboardResponse;
import com.inventory.entity.OrderStatus;
import com.inventory.repository.OrderRepository;
import com.inventory.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Service
public class DashboardService {
    private static final int LOW_STOCK_THRESHOLD = 5;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CurrentUserService currentUserService;

    public DashboardService(ProductRepository productRepository, OrderRepository orderRepository,
                            CurrentUserService currentUserService) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getSummary() {
        Long ownerId = currentUserService.getCurrentUser().getId();
        long products = productRepository.countByOwner_IdAndActiveTrue(ownerId);
        long orders = orderRepository.countByOwner_Id(ownerId);
        long lowStock = productRepository.countByOwner_IdAndActiveTrueAndQuantityLessThanEqual(ownerId, LOW_STOCK_THRESHOLD);
        BigDecimal sales = orderRepository.sumTotalByOwnerAndStatus(ownerId, OrderStatus.COMPLETED);
        return new DashboardResponse(products, orders, lowStock, sales == null ? BigDecimal.ZERO : sales);
    }
}
