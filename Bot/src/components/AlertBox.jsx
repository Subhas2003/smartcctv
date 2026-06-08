import alarm from "../assets/sound/alarm.mp3";

export default function AlertBox({ active }) {
  if (active) new Audio(alarm).play();

  return active ? (
    <div className="mt-6 bg-red-600 text-white p-4 rounded animate-pulse">
      🔴 DANGER! FIRE DETECTED
    </div>
  ) : null;
}
