package com.stevechat.controller;

import java.security.Principal;
import java.util.Locale;
import java.util.Objects;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.stevechat.dto.MessageDto;
import com.stevechat.dto.SendMessageRequest;
import com.stevechat.entity.Conversation;
import com.stevechat.entity.Message;
import com.stevechat.entity.User;
import com.stevechat.repository.ConversationRepository;
import com.stevechat.repository.MessageRepository;
import com.stevechat.repository.UserRepository;

@RestController
public class ChatWebSocketController {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatWebSocketController(MessageRepository messageRepository,
                                    ConversationRepository conversationRepository,
                                    UserRepository userRepository,
                                    SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    private Long resolveSenderId(String username) {
        try {
            Long userId = Long.valueOf(username);
            if (userRepository.existsById(Objects.requireNonNull(userId))) {
                return userId;
            }
        } catch (NumberFormatException ignored) {
            
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return user.getId();
    }

    private MessageDto persistAndBroadcast(SendMessageRequest request, Long senderId) {
        Long conversationId = request.getConversationId();
        if (conversationId == null) {
            throw new RuntimeException("Conversation ID is required");
        }

        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (!conv.getUserAId().equals(senderId) && !conv.getUserBId().equals(senderId)) {
            throw new RuntimeException("Not part of this conversation");
        }

        String rawType = request.getMessageType() == null ? "TEXT" : request.getMessageType();
        String messageType = rawType.trim().toUpperCase(Locale.ROOT);
        if (!"TEXT".equals(messageType) && !"AUDIO".equals(messageType)) {
            throw new RuntimeException("Unsupported message type");
        }

        String content = request.getContent() == null ? "" : request.getContent().trim();
        if (content.isEmpty()) {
            throw new RuntimeException("Message content cannot be empty");
        }

        Message message = new Message(conversationId, senderId, content);
        message.setMessageType(messageType);
        message.setDelivered(false);

        Message saved = messageRepository.save(message);

        MessageDto dto = new MessageDto(saved);
        messagingTemplate.convertAndSend("/topic/conversation." + conversationId, dto);
        return dto;
    }


    @MessageMapping("/chat.send")
    public void sendViaWebSocket(SendMessageRequest request, Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new RuntimeException("Unauthorized websocket sender");
        }
        Long senderId = resolveSenderId(principal.getName());
        persistAndBroadcast(request, senderId);
    }

    @PostMapping("/messages/send")
    public ResponseEntity<?> sendViaRest(@RequestBody SendMessageRequest request, Authentication auth) {
        try {
            Long senderId = resolveSenderId(auth.getName());
            return ResponseEntity.ok(persistAndBroadcast(request, senderId));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
