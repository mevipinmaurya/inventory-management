package com.inventory.dto;

import com.inventory.entity.CustomerOrder;
import com.inventory.entity.OrderItem;
import com.inventory.entity.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long orderId,
        String customerName,
        BigDecimal totalAmount,
        OrderStatus status,
        LocalDateTime createdAt,
        List<OrderLineResponse> items
) {
    public record OrderLineResponse(
            Long productId, String productName, int quantity,
            BigDecimal unitPrice, BigDecimal lineTotal
    ) {}

    public static OrderResponse from(CustomerOrder order) {
        List<OrderLineResponse> lines = order.getItems().stream()
                .map(item -> new OrderLineResponse(
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
                )).toList();

        return new OrderResponse(order.getId(), order.getCustomerName(),
                order.getTotalAmount(), order.getStatus(), order.getCreatedAt(), lines);
    }
}
