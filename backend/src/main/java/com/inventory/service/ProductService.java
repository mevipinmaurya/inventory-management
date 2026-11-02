package com.inventory.service;

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

    public ProductService(ProductRepository productRepository,
                          OrderItemRepository orderItemRepository) {
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public List<ProductResponse> getAll(String name) {
        List<Product> products = (name == null || name.isBlank())
                ? productRepository.findByActiveTrueOrderByNameAsc()
                : productRepository.findByActiveTrueAndNameContainingIgnoreCaseOrderByNameAsc(name);
        return products.stream().map(ProductResponse::from).toList();
    }

    public ProductResponse getById(Long id) {
        return ProductResponse.from(findActiveProduct(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product product = new Product(request.name().trim(), request.category().trim(),
                request.price(), request.quantity());
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findActiveProductForUpdate(id);
        product.setName(request.name().trim());
        product.setCategory(request.category().trim());
        product.setPrice(request.price());
        product.setQuantity(request.quantity());
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public void deactivate(Long id) {
        Product product = findActiveProductForUpdate(id);
        if (orderItemRepository.existsByProductId(id)) {
            product.setActive(false);
        } else {
            productRepository.delete(product);
        }
    }

    @Transactional
    public ProductResponse changeStock(Long id, StockChangeRequest request) {
        if (request.change() == 0) {
            throw new BadRequestException("Stock change cannot be zero.");
        }
        Product product = findActiveProductForUpdate(id);
        long updated = (long) product.getQuantity() + request.change();
        if (updated < 0) {
            throw new BadRequestException("Stock cannot become negative.");
        }
        if (updated > Integer.MAX_VALUE) {
            throw new BadRequestException("Stock quantity is too large.");
        }
        product.setQuantity((int) updated);
        return ProductResponse.from(productRepository.save(product));
    }

    public List<ProductResponse> getLowStock() {
        return productRepository
                .findByActiveTrueAndQuantityLessThanEqualOrderByQuantityAsc(LOW_STOCK_THRESHOLD)
                .stream().map(ProductResponse::from).toList();
    }

    private Product findActiveProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        if (!product.isActive()) {
            throw new ResourceNotFoundException("Product not found: " + id);
        }
        return product;
    }

    private Product findActiveProductForUpdate(Long id) {
        Product product = productRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        if (!product.isActive()) {
            throw new ResourceNotFoundException("Product not found: " + id);
        }
        return product;
    }
}
