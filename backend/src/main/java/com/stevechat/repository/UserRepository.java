package com.stevechat.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.stevechat.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findByIdNot(Long id);
    List<User> findByUsernameContainingIgnoreCaseAndIdNot(String query, Long id);
    List<User> findByNameContainingIgnoreCaseAndIdNot(String query, Long id);
}
