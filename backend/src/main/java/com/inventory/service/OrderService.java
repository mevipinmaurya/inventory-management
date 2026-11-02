package com.inventory.service;

import com.inventory.auth.AppUser;
import com.inventory.auth.CurrentUserService;
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
    private final CurrentUserService currentUserService;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository,
                        CurrentUserService currentUserService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public OrderResponse create(CreateOrderRequest request) {
        AppUser owner = currentUserService.getCurrentUser();
        CustomerOrder order = new CustomerOrder(request.customerName().trim());
        order.setOwner(owner);
        BigDecimal total = BigDecimal.ZERO;

        for (CreateOrderRequest.OrderLineRequest line : request.items()) {
            Product product = productRepository.findByIdAndOwnerIdForUpdate(line.productId(), owner.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + line.productId()));
            if (!product.isActive()) throw new BadRequestException("Product is inactive: " + product.getName());
            if (line.quantity() < 1) throw new BadRequestException("Order quantity must be at least 1.");
            if (product.getQuantity() < line.quantity()) throw new BadRequestException("Insufficient stock for product: " + product.getName());
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(line.quantity()));
            total = total.add(lineTotal);
            product.setQuantity(product.getQuantity() - line.quantity());
            order.addItem(new OrderItem(product, line.quantity(), product.getPrice()));
        }
        order.setTotalAmount(total);
        return OrderResponse.from(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAll() {
        Long ownerId = currentUserService.getCurrentUser().getId();
        return orderRepository.findAllByOwner_IdOrderByCreatedAtDesc(ownerId).stream().map(OrderResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getById(Long id) {
        Long ownerId = currentUserService.getCurrentUser().getId();
        return OrderResponse.from(findOrder(id, ownerId));
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatusRequest request) {
        Long ownerId = currentUserService.getCurrentUser().getId();
        CustomerOrder order = findOrder(id, ownerId);
        OrderStatus requested = request.status();
        if (order.getStatus() != OrderStatus.PLACED) throw new BadRequestException("Only PLACED orders can be completed or cancelled.");
        if (requested == OrderStatus.PLACED) throw new BadRequestException("Order is already PLACED.");

        if (requested == OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                Product product = productRepository.findByIdAndOwnerIdForUpdate(item.getProduct().getId(), ownerId)
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + item.getProduct().getId()));
                product.setQuantity(Math.addExact(product.getQuantity(), item.getQuantity()));
            }
        }
        order.setStatus(requested);
        return OrderResponse.from(orderRepository.save(order));
    }

    private CustomerOrder findOrder(Long id, Long ownerId) {
        return orderRepository.findByIdAndOwner_Id(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }
}
