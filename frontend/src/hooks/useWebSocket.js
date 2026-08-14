import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { sendMessageRest } from "../api/conversationApi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const WS_URL = `${API_BASE_URL.replace(/\/+$/, "")}/ws`;

// Connects to the STOMP broker and subscribes to a single conversation's topic.
// Call sendMessage(content) to publish; onMessage(msg) fires for every incoming frame.
export function useWebSocket(conversationId, onMessage) {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!conversationId) return;

    const token = localStorage.getItem("token");

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/conversation.${conversationId}`, (frame) => {
          const body = JSON.parse(frame.body);
          onMessage(body);
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => {
        console.error("STOMP error", frame.headers["message"], frame.body);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const sendMessage = useCallback(
    async ({ content, messageType = "TEXT" }) => {
      const normalizedContent = (content || "").trim();
      if (!normalizedContent || !conversationId) {
        return { ok: false, error: "Message content is empty." };
      }

      const normalizedType = String(messageType || "TEXT").toUpperCase();

      // Voice notes always go through REST: base64 audio payloads are far more likely to
      // exceed websocket/STOMP frame limits or get silently dropped mid-flight, and REST
      // gives us a concrete success/failure response so the recipient reliably gets it.
      if (normalizedType !== "AUDIO" && clientRef.current?.connected) {
        try {
          clientRef.current.publish({
            destination: "/app/chat.send",
            body: JSON.stringify({
              conversationId,
              content: normalizedContent,
              messageType: normalizedType,
            }),
          });
          return { ok: true, via: "ws" };
        } catch {
          // Fallback to REST below if websocket publish fails.
        }
      }

      try {
        const saved = await sendMessageRest(
          conversationId,
          normalizedContent,
          normalizedType,
          { silentAuth: true },
        );
        onMessage(saved);
        return { ok: true, via: "rest" };
      } catch (err) {
        const serverReason =
          typeof err?.response?.data === "string"
            ? err.response.data
            : err?.response?.data?.message;
        const fallback =
          normalizedType === "AUDIO"
            ? "Voice message failed to send."
            : "Message failed to send.";

        console.error(
          "sendMessage failed",
          err?.response?.status,
          err?.response?.data || err,
        );

        return {
          ok: false,
          error: serverReason ? `${fallback} (${serverReason})` : fallback,
        };
      }
    },
    [conversationId, onMessage],
  );

  return { connected, sendMessage };
}
