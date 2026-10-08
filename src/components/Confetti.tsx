import { motion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#f04456", "#16b981", "#f7c948", "#2f80ed", "#ff7a59", "#7c3aed"];

export function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 70 }, (_, index) => ({
        id: index,
        left: (index * 37) % 100,
        delay: (index % 12) * 0.08,
        color: COLORS[index % COLORS.length],
        rotate: (index * 71) % 360,
        size: 6 + (index % 4) * 2,
      })),
    [],
  );

  return (
    <div className="confetti-layer" aria-hidden="true">
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          style={{ left: `${piece.left}%`, background: piece.color, width: piece.size, height: piece.size * 1.7 }}
          initial={{ y: -80, opacity: 0, rotate: piece.rotate }}
          animate={{ y: "110vh", opacity: [0, 1, 1, 0], rotate: piece.rotate + 540 }}
          transition={{ duration: 3.2, delay: piece.delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
