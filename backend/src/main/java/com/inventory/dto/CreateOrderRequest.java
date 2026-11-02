package com.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateOrderRequest(
        @NotBlank @Size(max = 120) String customerName,
        @NotEmpty List<@Valid OrderLineRequest> items
) {
    public record OrderLineRequest(
            @jakarta.validation.constraints.NotNull Long productId,
            @jakarta.validation.constraints.Min(1) int quantity
    ) {}
}
