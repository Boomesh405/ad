package com.estatehub.service;

import com.estatehub.config.JwtUtil;
import com.estatehub.dto.AuthResponse;
import com.estatehub.dto.LoginRequest;
import com.estatehub.dto.RegisterRequest;
import com.estatehub.entity.User;
import com.estatehub.entity.enums.Role;
import com.estatehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Privilege escalation guard: SUPER_ADMIN can only be created by an existing admin/seed data,
        // never via self-registration (SRS 5.3).
        if (request.getRole() == Role.SUPER_ADMIN) {
            throw new IllegalArgumentException("SUPER_ADMIN cannot be self-registered");
        }

        if (userRepository.existsByMobile(request.getMobile())) {
            throw new IllegalArgumentException("Mobile number already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .mobile(request.getMobile())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                // Agents start unverified; KYC (Aadhaar+PAN) required before listing (SRS 2.5, FR12)
                .kycVerified(request.getRole() != Role.AGENT)
                .build();

        user = userRepository.save(user);
        return issueTokens(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByMobile(request.getMobile())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        if (!user.isActive()) {
            throw new BadCredentialsException("Account is suspended");
        }

        return issueTokens(user);
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtUtil.generateAccessToken(user.getMobile(), user.getRole().name(), user.getUserId().toString());
        String refreshToken = jwtUtil.generateRefreshToken(user.getMobile(), user.getUserId().toString());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getUserId().toString())
                .name(user.getName())
                .role(user.getRole().name())
                .build();
    }
}
