package com.inventory.repository;

import com.inventory.entity.CustomerOrder;
import com.inventory.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {
    List<CustomerOrder> findAllByOwner_IdOrderByCreatedAtDesc(Long ownerId);
    Optional<CustomerOrder> findByIdAndOwner_Id(Long id, Long ownerId);
    long countByOwner_Id(Long ownerId);

    @Query("select coalesce(sum(o.totalAmount), 0) from CustomerOrder o where o.owner.id = :ownerId and o.status = :status")
    BigDecimal sumTotalByOwnerAndStatus(@Param("ownerId") Long ownerId, @Param("status") OrderStatus status);
}
