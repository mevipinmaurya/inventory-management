package com.inventory.dto;

import jakarta.validation.constraints.NotNull;

public record StockChangeRequest(@NotNull Integer change) {}
