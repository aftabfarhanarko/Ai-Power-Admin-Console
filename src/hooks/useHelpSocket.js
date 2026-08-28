import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "@/config/api";
import { playNotificationSound } from "@/utils/notificationSound";

/**
 * Connect to help-support socket, join ticket room, and receive real-time replies.
 * Plays sound when a new reply arrives (from another user - not self).
 *
 * @param {number|string|null} ticketId - Ticket ID to join
 * @param {Object} options
 * @param {Function} options.onReply - Callback when new reply received: (reply) => void
 * @param {string} options.currentUserName - Current user's name (to avoid playing sound for own replies)
 * @param {boolean} options.playSound - Whether to play sound on new reply (default true)
 */
export function useHelpSocket(ticketId, options = {}) {
  const { onReply, currentUserName = "", playSound = true } = options;
  const socketRef = useRef(null);
  const onReplyRef = useRef(onReply);
  const currentUserNameRef = useRef(currentUserName);

  onReplyRef.current = onReply;
  currentUserNameRef.current = currentUserName;

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("help:leave", { ticketId: Number(ticketId) });
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, [ticketId]);

  useEffect(() => {
    if (!ticketId) return;

    const numericId = Number(ticketId);
    const socketUrl = API_BASE_URL.replace(/\/$/, "");
    const socket = io(`${socketUrl}/help-support`, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("help:join", { ticketId: numericId });
    });

    socket.on("help:reply", (data) => {
      const { reply } = data || {};
      if (!reply) return;

      // Don't play sound for own messages
      const isOwn = currentUserNameRef.current && reply.author === currentUserNameRef.current;
      if (playSound && !isOwn) {
        playNotificationSound("message");
      }

      onReplyRef.current?.(reply);
    });

    return () => {
      socket.emit("help:leave", { ticketId: numericId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [ticketId, playSound]);

  return { disconnect };
}
