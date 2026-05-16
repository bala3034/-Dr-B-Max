/**
 * Service Worker registration helper for Dr. B-MAX
 */

export async function registerAlarmWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;

  try {
    const reg = await navigator.serviceWorker.register("/sw-alarm.js", { scope: "/" });
    console.log("[Dr. B-MAX] Alarm SW registered:", reg.scope);
    return reg;
  } catch (err) {
    console.error("[Dr. B-MAX] Alarm SW registration failed:", err);
    return null;
  }
}

export async function scheduleAlarmsInSW(alarms: { id: number; name: string; dosage: string; time: string }[]) {
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  if (reg.active) {
    reg.active.postMessage({ type: "SCHEDULE_ALARMS", alarms });
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function listenForSWMessages(callback: (data: { type: string; id?: number }) => void) {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.addEventListener("message", (event) => {
    callback(event.data);
  });
}
