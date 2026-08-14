import { useState } from "react";
import { updateProfile } from "../api/userApi";

export default function Settings({ user, onProfileUpdate }) {
  const MAX_AVATAR_BYTES = 1024 * 1024 * 2;
  const [name, setName] = useState(user.name || "");
  const [username, setUsername] = useState(user.username);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus({ type: "error", text: "Please choose an image file." });
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      if (!/^[a-zA-Z0-9._-]{3,20}$/.test(username)) {
        setStatus({ type: "error", text: "Invalid username format" });
        return;
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(String(reader.result || ""));
      setStatus(null);
    };
    reader.onerror = () => {
      setStatus({ type: "error", text: "Unable to read image file." });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    const currentPwd = currentPassword.trim();
    const nextPwd = newPassword.trim();
    const wantsPasswordChange = currentPwd.length > 0 || nextPwd.length > 0;

    if (wantsPasswordChange && (!currentPwd || !nextPwd)) {
      setStatus({
        type: "error",
        text: "To change password, fill both current and new password.",
      });
      return;
    }

    try {
      setSaving(true);
      const updated = await updateProfile({
        name,
        username,
        avatarUrl,
        currentPassword: wantsPasswordChange ? currentPwd : undefined,
        newPassword: wantsPasswordChange ? nextPwd : undefined,
      });
      onProfileUpdate(updated);
      setCurrentPassword("");
      setNewPassword("");
      setStatus({ type: "success", text: "Profile updated!" });
    } catch (err) {
      setStatus({ type: "error", text: err.response?.data || "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page settings-page">
      <h1>Settings</h1>

      <form className="settings-form" onSubmit={handleSubmit}>
        <label>Your Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Display name others search for"
        />

        <label>
          Username{" "}
          <span
            style={{
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              fontWeight: 400,
            }}
          >
            (private — login only)
          </span>
        </label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />

        <label>Upload avatar from your device</label>
        <input type="file" accept="image/*" onChange={handleAvatarFile} />

        <label>Avatar URL (optional)</label>
        <input
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://..."
        />

        {avatarUrl && (
          <>
            <img
              className="settings-avatar-preview"
              src={avatarUrl}
              alt="Avatar preview"
            />
            <button
              type="button"
              className="settings-clear-avatar"
              onClick={() => setAvatarUrl("")}
            >
              Remove avatar
            </button>
          </>
        )}

        <hr />

        <label>Current password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Required only to change password"
          autoComplete="off"
        />

        <label>New password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />

        {status && (
          <div className={`settings-status ${status.type}`}>
            {String(status.text)}
          </div>
        )}

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
