/**
 * Play a short notification sound using Web Audio API.
 * No external audio files required - generates a pleasant beep.
 */
let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Play notification sound (e.g. for new notifications, help replies).
 * @param {string} type - 'notification' | 'message' - slight variation in tone
 */
export function playNotificationSound(type = "notification") {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Slight variation: notification = higher, message = slightly lower
    oscillator.frequency.value = type === "message" ? 880 : 660;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.warn("Notification sound failed:", e);
  }
}
