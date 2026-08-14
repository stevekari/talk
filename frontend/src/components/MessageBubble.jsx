export default function MessageBubble({ message, isMine }) {
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isAudio = message.messageType === "AUDIO";

  return (
    <div className={`message-row ${isMine ? "mine" : "theirs"}`}>
      <div className={`message-bubble ${isMine ? "mine" : "theirs"}`}>
        {isAudio ? (
          <audio
            className="message-audio"
            controls
            src={message.content}
            preload="metadata"
          />
        ) : (
          <div className="message-content">{message.content}</div>
        )}
        <div className="message-time-wrap">
          <div className="message-time">{time}</div>
          {isMine && (
            <span
              className={`delivery-tick ${message.delivered ? "delivered" : "pending"}`}
            >
              {message.delivered ? "✓" : "○"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
