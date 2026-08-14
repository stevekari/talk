import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { searchUsers } from "../api/userApi";
import { getMyConversations, startConversation } from "../api/conversationApi";

export default function Sidebar() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Derive active conversation id from the current URL path.
  const activeId = location.pathname.startsWith("/chat/")
    ? location.pathname.split("/chat/")[1]
    : null;

  const loadConversations = useCallback(() => {
    getMyConversations()
      .then(setConversations)
      .catch(() => {});
  }, []);

  // Load on mount and refresh every 8 seconds so new messages appear.
  useEffect(() => {
    loadConversations();
    const id = setInterval(loadConversations, 8000);
    return () => clearInterval(id);
  }, [loadConversations]);

  // Also refresh whenever the active conversation changes (user just started a new chat).
  useEffect(() => {
    loadConversations();
  }, [activeId, loadConversations]);

  // Debounced search.
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearching(true);
      searchUsers(query)
        .then(setSearchResults)
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 350);
  }, [query]);

  const openFromSearch = async (user) => {
    try {
      const { conversationId } = await startConversation(user.id);
      setQuery("");
      setSearchResults([]);
      loadConversations();
      navigate(`/chat/${conversationId}`, { state: { friend: user } });
    } catch {
      // Auth redirect handled by Axios interceptor.
    }
  };

  const openConversation = (conv) => {
    navigate(`/chat/${conv.conversationId}`, {
      state: { friend: conv.otherUser },
    });
  };

  const avatar = (user) => {
    const display = user?.name || user?.username || "?";
    return (
      user?.avatarUrl ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(display)}`
    );
  };

  const displayName = (user) => user?.name || user?.username || "Unknown";

  return (
    <aside className="sidebar">
      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Search by username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {query.trim() ? (
        <div className="sidebar-list">
          {searching && <div className="sidebar-hint">Searching…</div>}
          {!searching && searchResults.length === 0 && (
            <div className="sidebar-hint">
              No users found for &ldquo;{query}&rdquo;
            </div>
          )}
          {searchResults.map((u) => (
            <div
              key={u.id}
              className="sidebar-item"
              onClick={() => openFromSearch(u)}
            >
              <img src={avatar(u)} alt={displayName(u)} />
              <div className="sidebar-item-info">
                <span className="sidebar-item-name">{displayName(u)}</span>
                <span className="sidebar-item-preview">@{u.username}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="sidebar-list">
          {conversations.length === 0 && (
            <div className="sidebar-hint">
              Search for someone above to start a chat.
            </div>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.conversationId}
              className={`sidebar-item${String(conv.conversationId) === String(activeId) ? " active" : ""}`}
              onClick={() => openConversation(conv)}
            >
              <img
                src={avatar(conv.otherUser)}
                alt={displayName(conv.otherUser)}
              />
              <div className="sidebar-item-info">
                <span className="sidebar-item-name">
                  {displayName(conv.otherUser)}
                </span>
                {conv.lastMessage && (
                  <span className="sidebar-item-preview">
                    {conv.lastMessage}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
