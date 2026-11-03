package com.inventory.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwt;
    private final AppUserRepository users;

    public JwtAuthFilter(JwtService jwt, AppUserRepository users) {
        this.jwt = jwt;
        this.users = users;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return "OPTIONS".equalsIgnoreCase(request.getMethod())
                || "/api/auth/login".equals(path)
                || "/api/auth/signup".equals(path);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = header.substring(7).trim();
            try {
                String email = jwt.extractEmail(token);
                if (email != null && !email.isBlank()) {
                    AppUser user = users.findByEmailIgnoreCase(email).orElse(null);
                    if (user != null) {
                        var authentication = new UsernamePasswordAuthenticationToken(
                                user.getEmail(),
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
                        );
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            } catch (Exception ignored) {
                // Invalid/expired tokens remain unauthenticated. Spring Security
                // then rejects protected endpoints; public auth endpoints still work.
                SecurityContextHolder.clearContext();
            }
        }

        chain.doFilter(request, response);
    }
}
