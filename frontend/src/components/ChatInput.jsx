import { useEffect, useRef, useState } from "react";

export default function ChatInput({ onSend }) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("");
  const [recordError, setRecordError] = useState("");
  const [sending, setSending] = useState(false);

  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [audioPreviewUrl]);

  const isSendSuccessful = (result) => {
    if (result === false) return false;
    if (result && typeof result === "object" && result.ok === false) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setRecordError("");
    setSending(true);
    try {
      const result = await onSend({ content: trimmed, messageType: "TEXT" });
      if (!isSendSuccessful(result)) {
        setRecordError(result?.error || "Message failed to send.");
        return;
      }
      setText("");
    } finally {
      setSending(false);
    }
  };

  const startRecording = async () => {
    setRecordError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setRecordError("Voice recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        if (audioPreviewUrl) {
          URL.revokeObjectURL(audioPreviewUrl);
        }
        setAudioPreviewUrl(URL.createObjectURL(blob));
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      setRecordError("Microphone access was denied.");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const discardVoice = () => {
    setAudioBlob(null);
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
    }
    setAudioPreviewUrl("");
  };

  const readBlobAsDataUrl = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Voice encoding failed"));
      reader.readAsDataURL(blob);
    });

  const sendVoice = async () => {
    if (!audioBlob || sending) return;

    setRecordError("");
    setSending(true);
    try {
      const dataUrl = await readBlobAsDataUrl(audioBlob);
      if (!dataUrl) {
        setRecordError("Could not encode your voice note.");
        return;
      }

      const result = await onSend({ content: dataUrl, messageType: "AUDIO" });
      if (!isSendSuccessful(result)) {
        setRecordError(result?.error || "Voice message failed to send.");
        return;
      }

      discardVoice();
    } catch {
      setRecordError("Voice message failed to send.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        placeholder="Type a message..."
        onChange={(e) => setText(e.target.value)}
        disabled={sending}
      />
      <div className="chat-input-controls">
        <button type="submit" className="send-btn" disabled={sending || !text.trim()}>
        <i className="fa-solid fa-paper-plane"></i>
        </button>
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            className="record-btn"
            disabled={sending}
          >
           <i className="fa-solid fa-microphone"></i>
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="record-btn recording"
            disabled={sending}
          >
            <i className="fa-solid fa-circle-xmark" style={{color: "white"}}></i>
          </button>
        )}
      </div>

      {audioPreviewUrl && (
        <div className="voice-preview">
          <audio controls src={audioPreviewUrl} />
          <button
            type="button"
            onClick={sendVoice}
            className="voice-send-btn"
            disabled={sending}
          >
           <i className="fa-solid fa-arrow-up-from-bracket"></i>
          </button>
          <button
            type="button"
            onClick={discardVoice}
            className="voice-discard-btn"
            disabled={sending}
          >
          <i className="fa-solid fa-x" style={{color: "white"}}></i>
          </button>
        </div>
      )}

      {recordError && <div className="chat-input-error">{recordError}</div>}
    </form>
  );
}
