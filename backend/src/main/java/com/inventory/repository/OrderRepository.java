package com.inventory.repository;

import com.inventory.entity.CustomerOrder;
import com.inventory.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {
    List<CustomerOrder> findAllByOrderByCreatedAtDesc();

    long countByStatus(OrderStatus status);

    @Query("select coalesce(sum(o.totalAmount), 0) from CustomerOrder o where o.status = :status")
    BigDecimal sumTotalByStatus(OrderStatus status);
}
