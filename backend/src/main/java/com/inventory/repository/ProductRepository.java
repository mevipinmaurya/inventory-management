package com.inventory.repository;

import com.inventory.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByOwner_IdAndActiveTrueOrderByNameAsc(Long ownerId);
    List<Product> findByOwner_IdAndActiveTrueAndNameContainingIgnoreCaseOrderByNameAsc(Long ownerId, String name);
    List<Product> findByOwner_IdAndActiveTrueAndQuantityLessThanEqualOrderByQuantityAsc(Long ownerId, int quantity);
    long countByOwner_IdAndActiveTrue(Long ownerId);
    long countByOwner_IdAndActiveTrueAndQuantityLessThanEqual(Long ownerId, int quantity);
    Optional<Product> findByIdAndOwner_IdAndActiveTrue(Long id, Long ownerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id and p.owner.id = :ownerId")
    Optional<Product> findByIdAndOwnerIdForUpdate(@Param("id") Long id, @Param("ownerId") Long ownerId);
}
