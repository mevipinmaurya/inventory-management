package com.inventory.auth;
import jakarta.validation.constraints.*;
public class AuthDtos {
    public record SignupRequest(@NotBlank @Size(max=80) String name, @NotBlank @Email @Size(max=160) String email, @NotBlank @Size(min=8,max=72) String password) {}
    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
    public record AuthResponse(String token, String tokenType, Long id, String name, String email, String role) {}
}
