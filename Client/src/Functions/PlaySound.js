// utils/playSound.js
export const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(err => {
      console.log("Autoplay prevented:", err);
    });
  };
  