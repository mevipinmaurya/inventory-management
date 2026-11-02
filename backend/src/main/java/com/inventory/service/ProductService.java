package com.inventory.service;

import com.inventory.auth.AppUser;
import com.inventory.auth.CurrentUserService;
import com.inventory.dto.ProductRequest;
import com.inventory.dto.ProductResponse;
import com.inventory.dto.StockChangeRequest;
import com.inventory.entity.Product;
import com.inventory.exception.BadRequestException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.repository.OrderItemRepository;
import com.inventory.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {
    private static final int LOW_STOCK_THRESHOLD = 5;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final CurrentUserService currentUserService;

    public ProductService(ProductRepository productRepository, OrderItemRepository orderItemRepository,
                          CurrentUserService currentUserService) {
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAll(String name) {
        Long ownerId = currentUserService.getCurrentUser().getId();
        List<Product> products = (name == null || name.isBlank())
                ? productRepository.findByOwner_IdAndActiveTrueOrderByNameAsc(ownerId)
                : productRepository.findByOwner_IdAndActiveTrueAndNameContainingIgnoreCaseOrderByNameAsc(ownerId, name.trim());
        return products.stream().map(ProductResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return ProductResponse.from(findActiveProduct(id, currentUserService.getCurrentUser().getId()));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        AppUser owner = currentUserService.getCurrentUser();
        Product product = new Product(request.name().trim(), request.category().trim(), request.price(), request.quantity());
        product.setOwner(owner);
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Long ownerId = currentUserService.getCurrentUser().getId();
        Product product = findActiveProductForUpdate(id, ownerId);
        product.setName(request.name().trim()); product.setCategory(request.category().trim());
        product.setPrice(request.price()); product.setQuantity(request.quantity());
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public void deactivate(Long id) {
        Long ownerId = currentUserService.getCurrentUser().getId();
        Product product = findActiveProductForUpdate(id, ownerId);
        if (orderItemRepository.existsByProductId(id)) product.setActive(false);
        else productRepository.delete(product);
    }

    @Transactional
    public ProductResponse changeStock(Long id, StockChangeRequest request) {
        if (request.change() == 0) throw new BadRequestException("Stock change cannot be zero.");
        Long ownerId = currentUserService.getCurrentUser().getId();
        Product product = findActiveProductForUpdate(id, ownerId);
        long updated = (long) product.getQuantity() + request.change();
        if (updated < 0) throw new BadRequestException("Stock cannot become negative.");
        if (updated > Integer.MAX_VALUE) throw new BadRequestException("Stock quantity is too large.");
        product.setQuantity((int) updated);
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStock() {
        Long ownerId = currentUserService.getCurrentUser().getId();
        return productRepository.findByOwner_IdAndActiveTrueAndQuantityLessThanEqualOrderByQuantityAsc(ownerId, LOW_STOCK_THRESHOLD)
                .stream().map(ProductResponse::from).toList();
    }

    private Product findActiveProduct(Long id, Long ownerId) {
        return productRepository.findByIdAndOwner_IdAndActiveTrue(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    private Product findActiveProductForUpdate(Long id, Long ownerId) {
        Product product = productRepository.findByIdAndOwnerIdForUpdate(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        if (!product.isActive()) throw new ResourceNotFoundException("Product not found: " + id);
        return product;
    }
}
