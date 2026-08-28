import { useEffect, useRef } from "react";
import { playNotificationSound } from "@/utils/notificationSound";

/**
 * Plays a sound when the unread notification count increases.
 * @param {number} unreadCount - Current unread notification count
 * @param {boolean} enabled - Whether to play sound (e.g. when tab is focused)
 */
export function useNotificationSound(unreadCount, enabled = true) {
  const prevCountRef = useRef(unreadCount);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!enabled) return;

    // Skip first render to avoid playing on initial load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevCountRef.current = unreadCount;
      return;
    }

    if (unreadCount > prevCountRef.current) {
      playNotificationSound("notification");
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount, enabled]);
}
