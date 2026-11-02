package com.inventory.service;

import com.inventory.dto.CreateOrderRequest;
import com.inventory.dto.OrderResponse;
import com.inventory.dto.OrderStatusRequest;
import com.inventory.entity.CustomerOrder;
import com.inventory.entity.OrderItem;
import com.inventory.entity.OrderStatus;
import com.inventory.entity.Product;
import com.inventory.exception.BadRequestException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.repository.OrderRepository;
import com.inventory.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public OrderResponse create(CreateOrderRequest request) {
        CustomerOrder order = new CustomerOrder(request.customerName().trim());
        BigDecimal total = BigDecimal.ZERO;

        // Lock each product row while checking and updating its stock.
        for (CreateOrderRequest.OrderLineRequest line : request.items()) {
            Product product = productRepository.findByIdForUpdate(line.productId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found: " + line.productId()));

            if (!product.isActive()) {
                throw new BadRequestException("Product is inactive: " + product.getName());
            }
            if (line.quantity() < 1) {
                throw new BadRequestException("Order quantity must be at least 1.");
            }
            if (product.getQuantity() < line.quantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName());
            }

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(line.quantity()));
            total = total.add(lineTotal);

            product.setQuantity(product.getQuantity() - line.quantity());
            order.addItem(new OrderItem(product, line.quantity(), product.getPrice()));
        }

        order.setTotalAmount(total);
        CustomerOrder saved = orderRepository.save(order);
        return OrderResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAll() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(OrderResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getById(Long id) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatusRequest request) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));

        OrderStatus requested = request.status();
        if (order.getStatus() != OrderStatus.PLACED) {
            throw new BadRequestException("Only PLACED orders can be completed or cancelled.");
        }
        if (requested == OrderStatus.PLACED) {
            throw new BadRequestException("Order is already PLACED.");
        }

        if (requested == OrderStatus.CANCELLED) {
            // Restore stock once. Status transition rules prevent repeated restoration.
            for (OrderItem item : order.getItems()) {
                Product product = productRepository.findByIdForUpdate(item.getProduct().getId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Product not found: " + item.getProduct().getId()));
                product.setQuantity(Math.addExact(product.getQuantity(), item.getQuantity()));
            }
        }

        order.setStatus(requested);
        return OrderResponse.from(orderRepository.save(order));
    }
}
