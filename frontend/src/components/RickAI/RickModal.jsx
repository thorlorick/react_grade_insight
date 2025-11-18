import React, { useState, useEffect, useRef } from "react";
import styles from "./RickModal.module.css";
import { sendMessage } from "../../api/rickAPI";

export default function RickModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const aiReply = await sendMessage(input);
      setMessages((m) => [...m, { sender: "ai", text: aiReply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { sender: "ai", text: "⚠️ Error talking to Rick_AI." }
      ]);
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* HEADER */}
        <div className={styles.header}>
          <h3 className={styles.title}>Rick_AI</h3>
          <button onClick={onClose}>✖</button>
        </div>

        {/* MESSAGES */}
        <div className={styles.messagesContainer}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={
                msg.sender === "user"
                  ? styles.userMessage
                  : styles.aiMessage
              }
            >
              {msg.text}
            </div>
          ))}

          {loading && <div className={styles.loading}>Typing...</div>}

          <div ref={endRef}></div>
        </div>

        {/* INPUT */}
        <div className={styles.inputContainer}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Rick something…"
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
}
