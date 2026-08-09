package com.estatehub.repository;

import com.estatehub.entity.User;
import com.estatehub.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByMobile(String mobile);
    Optional<User> findByEmail(String email);
    boolean existsByMobile(String mobile);
    List<User> findByRole(Role role);
}
