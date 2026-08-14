import api from "./axios";

export function startConversation(friendId) {
  return api.post("/conversations/start", { friendId }).then((res) => res.data);
}

export function getMyConversations() {
  // silentAuth: background polling — a 401 should not log the user out
  return api
    .get("/conversations/mine", { silentAuth: true })
    .then((res) => res.data);
}

export function getMessages(conversationId) {
  return api
    .get(`/conversations/${conversationId}/messages`)
    .then((res) => res.data);
}

export function sendMessageRest(
  conversationId,
  content,
  messageType = "TEXT",
  requestOptions = {},
) {
  return api
    .post(
      "/messages/send",
      { conversationId, content, messageType },
      requestOptions,
    )
    .then((res) => res.data);
}
