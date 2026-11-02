package com.inventory.auth;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final AppUserRepository users; private final PasswordEncoder encoder; private final JwtService jwt;
    public AuthController(AppUserRepository users,PasswordEncoder encoder,JwtService jwt){this.users=users;this.encoder=encoder;this.jwt=jwt;}
    @PostMapping("/signup") public AuthDtos.AuthResponse signup(@Valid @RequestBody AuthDtos.SignupRequest r){
        String email=r.email().trim().toLowerCase(); if(users.existsByEmailIgnoreCase(email)) throw new ResponseStatusException(HttpStatus.CONFLICT,"An account with this email already exists");
        AppUser u=users.save(new AppUser(r.name().trim(),email,encoder.encode(r.password()))); return response(u);
    }
    @PostMapping("/login") public AuthDtos.AuthResponse login(@Valid @RequestBody AuthDtos.LoginRequest r){
        AppUser u=users.findByEmailIgnoreCase(r.email().trim()).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid email or password"));
        if(!encoder.matches(r.password(),u.getPassword())) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid email or password"); return response(u);
    }
    private AuthDtos.AuthResponse response(AppUser u){return new AuthDtos.AuthResponse(jwt.generate(u),"Bearer",u.getId(),u.getName(),u.getEmail(),u.getRole());}
}
