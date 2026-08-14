package com.stevechat.dto;

import java.time.LocalDateTime;

import com.stevechat.entity.Message;

public class MessageDto {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String content;
    private String messageType;
    private boolean delivered;
    private LocalDateTime deliveredAt;
    private LocalDateTime timestamp;

    public MessageDto() {}

    public MessageDto(Message message) {
        this.id = message.getId();
        this.conversationId = message.getConversationId();
        this.senderId = message.getSenderId();
        this.content = message.getContent();
        this.messageType = message.getMessageType();
        this.delivered = message.isDelivered();
        this.deliveredAt = message.getDeliveredAt();
        this.timestamp = message.getTimestamp();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }

    public boolean isDelivered() { return delivered; }
    public void setDelivered(boolean delivered) { this.delivered = delivered; }

    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
