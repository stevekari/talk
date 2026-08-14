package com.stevechat.dto;

public class AuthResponse {
    private String token;
    private Long userId;
    private String username;
    private String name;
    private String avatarUrl;

    public AuthResponse(String token, Long userId, String username, String name, String avatarUrl) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.name = name;
        this.avatarUrl = avatarUrl;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}
