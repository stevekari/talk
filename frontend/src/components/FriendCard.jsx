export default function FriendCard({ friend, lastMessage, onClick }) {
  const displayName = friend.name || friend.username;
  return (
    <div className="friend-card" onClick={onClick}>
      <img
        className="friend-avatar"
        src={
          friend.avatarUrl ||
          "https://api.dicebear.com/7.x/initials/svg?seed=" +
            encodeURIComponent(displayName)
        }
        alt={displayName}
      />
      <div className="friend-info">
        <div className="friend-name">{displayName}</div>
        {lastMessage && <div className="friend-preview">{lastMessage}</div>}
      </div>
    </div>
  );
}
