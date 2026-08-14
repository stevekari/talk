import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const displayName = user?.name || user?.username || "User";
  const avatarSrc =
    user?.avatarUrl ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

  return (
    <nav className="navbar">
      <Link to="/friends" className="navbar-brand">
        <img
          src="/src/assets/steve.jpeg"
          alt="Logo"
          className="navbar-logo"
          width="50"
        />
      </Link>

      {user && (
        <div className="navbar-right">
          <Link to="/settings">Settings</Link>
          <div className="navbar-user">
            {/* <img className="navbar-avatar" src={avatarSrc} alt={displayName} /> */}
            <span className="navbar-username">{displayName}</span>
          </div>
          <button onClick={handleLogout}>Log out</button>
        </div>
      )}
    </nav>
  );
}
