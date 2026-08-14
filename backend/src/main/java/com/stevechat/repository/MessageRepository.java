package com.stevechat.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.stevechat.entity.Message;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationIdOrderByTimestampAsc(Long conversationId);
    Optional<Message> findTopByConversationIdOrderByTimestampDesc(Long conversationId);
    List<Message> findByConversationIdAndSenderIdNotAndDeliveredFalse(Long conversationId, Long senderId);
}
