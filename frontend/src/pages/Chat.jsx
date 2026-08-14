import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { getMessages, getMyConversations } from "../api/conversationApi";
import { useWebSocket } from "../hooks/useWebSocket";
import MessageBubble from "../components/MessageBubble";
import ChatInput from "../components/ChatInput";

export default function Chat({ currentUserId }) {
  const { conversationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [friend, setFriend] = useState(location.state?.friend || null);
  const [friendLoading, setFriendLoading] = useState(!location.state?.friend);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const handleIncoming = useCallback((message) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === message.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...message };
        return next;
      }
      return [...prev, message];
    });
  }, []);

  const { sendMessage } = useWebSocket(conversationId, handleIncoming);

  useEffect(() => {
    if (location.state?.friend) {
      setFriend(location.state.friend);
      setFriendLoading(false);
      return;
    }

    setFriendLoading(true);
    getMyConversations()
      .then((conversations) => {
        const matching = conversations.find(
          (c) => String(c.conversationId) === String(conversationId),
        );
        setFriend(matching?.otherUser || null);
      })
      .catch(() => {
        setFriend(null);
      })
      .finally(() => setFriendLoading(false));
  }, [conversationId, location.state]);

  useEffect(() => {
    setLoading(true);
    getMessages(conversationId)
      .then(setMessages)
      .catch(() => {
        setMessages([]);
      })
      .finally(() => setLoading(false));
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (friendLoading)
    return <div className="page-loading">Loading conversation…</div>;

  if (!friend) {
    return (
      <div className="page-loading">
        Conversation not found.{" "}
        <button className="link-button" onClick={() => navigate("/friends")}>
          Go home
        </button>
      </div>
    );
  }

  return (
    <div className="page chat-page">
      <div className="chat-header">
        <img
          src={
            friend.avatarUrl ||
            "https://api.dicebear.com/7.x/initials/svg?seed=" +
              encodeURIComponent(friend.name || friend.username)
          }
          alt={friend.name || friend.username}
        />
        <h2>{friend.name || friend.username}</h2>
      </div>

      <div className="chat-messages">
        {loading && <div className="page-loading">Loading conversation...</div>}
        {!loading && messages.length === 0 && (
          <div className="empty-state">Say hi to {friend.username}!</div>
        )}
        {messages.map((m) => (
          <MessageBubble
            key={m.id ?? `${m.senderId}-${m.timestamp}`}
            message={m}
            isMine={m.senderId === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={sendMessage} />
    </div>
  );
}
