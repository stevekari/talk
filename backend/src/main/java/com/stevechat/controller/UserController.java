package com.stevechat.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stevechat.dto.AuthResponse;
import com.stevechat.dto.UpdateProfileRequest;
import com.stevechat.dto.UserDto;
import com.stevechat.entity.User;
import com.stevechat.repository.UserRepository;
import com.stevechat.security.JwtUtil;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    private User currentUser(Authentication auth) {
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @GetMapping("/search")
    public List<UserDto> searchUsers(@RequestParam String q, Authentication auth) {
        User me = currentUser(auth);
        if (q == null || q.isBlank()) return List.of();
    
        return userRepository.findByUsernameContainingIgnoreCaseAndIdNot(q.trim(), me.getId())
                .stream()
                .map(UserDto::new)
                .toList();
    }

    @GetMapping("/me")
    public UserDto getMe(Authentication auth) {
        return new UserDto(currentUser(auth));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request, Authentication auth) {
        User me = currentUser(auth);

        if (request.getName() != null) {
            me.setName(request.getName());
        }

        if (request.getUsername() != null && !request.getUsername().isBlank()
                && !request.getUsername().equals(me.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                return ResponseEntity.badRequest().body("Username is already taken");
            }
            me.setUsername(request.getUsername());
        }

        if (request.getAvatarUrl() != null) {
            me.setAvatarUrl(request.getAvatarUrl());
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getCurrentPassword() == null
                    || !passwordEncoder.matches(request.getCurrentPassword(), me.getPassword())) {
                return ResponseEntity.badRequest().body("Current password is incorrect");
            }
            me.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        userRepository.save(me);
        String token = jwtUtil.generateToken(me);
        return ResponseEntity.ok(new AuthResponse(token, me.getId(), me.getUsername(), me.getName(), me.getAvatarUrl()));
    }
}
