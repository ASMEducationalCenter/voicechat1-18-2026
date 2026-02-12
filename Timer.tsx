import React, { useEffect, useMemo, useState } from "react";

type TimerProps = {
  minutes?: number;
  running: boolean;
  resetKey: number;
  onTimeUp: () => void;
};

const Timer: React.FC<TimerProps> = ({
  minutes = 30,
  running,
  resetKey,
  onTimeUp,
}) => {
  const totalSeconds = useMemo(() => minutes * 60, [minutes]);
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [fired, setFired] = useState(false);

  // Reset timer when a new interview starts
  useEffect(() => {
    setTimeLeft(totalSeconds);
    setFired(false);
  }, [resetKey, totalSeconds]);

  // Count down while interview is running
  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) return;

    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [running, timeLeft]);

  // Fire once when time hits 0
  useEffect(() => {
    if (!running) return;
    if (timeLeft > 0) return;
    if (fired) return;

    setFired(true);
    onTimeUp();
  }, [running, timeLeft, fired, onTimeUp]);

  const mm = Math.floor(timeLeft / 60);
  const ss = timeLeft % 60;

  return (
    <div style={styles.timer}>
      {mm}:{ss.toString().padStart(2, "0")}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  timer: {
    position: "fixed",
    top: 16,
    right: 20,
    background: "#111827",
    color: "#ffffff",
    padding: "8px 14px",
    borderRadius: 10,
    fontWeight: 700,
    zIndex: 9999,
  },
};

export default Timer;


