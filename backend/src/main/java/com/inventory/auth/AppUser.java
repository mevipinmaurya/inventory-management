package com.inventory.auth;

import jakarta.persistence.*;

@Entity
@Table(name = "app_users", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
public class AppUser {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 80) private String name;
    @Column(nullable = false, unique = true, length = 160) private String email;
    @Column(nullable = false) private String password;
    @Column(nullable = false, length = 20) private String role = "USER";
    public AppUser() {}
    public AppUser(String name, String email, String password) { this.name=name; this.email=email; this.password=password; }
    public Long getId(){return id;} public String getName(){return name;} public String getEmail(){return email;} public String getPassword(){return password;} public String getRole(){return role;}
    public void setName(String name){this.name=name;} public void setEmail(String email){this.email=email;} public void setPassword(String password){this.password=password;} public void setRole(String role){this.role=role;}
}
