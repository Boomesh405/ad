package com.estatehub.dto;

import com.estatehub.entity.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String mobile;

    @Email
    private String email;

    @NotBlank
    private String password;

    @NotNull
    private Role role;
}
