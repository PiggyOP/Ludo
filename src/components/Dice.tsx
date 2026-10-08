import { motion } from "framer-motion";

const DOTS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

interface DiceProps {
  canRoll: boolean;
  isRolling: boolean;
  value: number | null;
  onRoll: () => void;
}

export function Dice({ canRoll, isRolling, value, onRoll }: DiceProps) {
  const dots = DOTS[value ?? 6];
  return (
    <div className="dice-card">
      <motion.button
        aria-label="Roll dice"
        className="dice"
        disabled={!canRoll}
        type="button"
        animate={isRolling ? { rotate: [0, 120, 250, 360], scale: [1, 1.1, 0.94, 1] } : { rotate: 0, scale: 1 }}
        transition={{ duration: 0.62, ease: "easeInOut" }}
        whileHover={canRoll ? { y: -3 } : undefined}
        whileTap={canRoll ? { scale: 0.94 } : undefined}
        onClick={onRoll}
      >
        {Array.from({ length: 9 }, (_, index) => (
          <span key={index} className={dots.includes(index) ? "visible" : ""} />
        ))}
      </motion.button>
      <span className="dice-label">{canRoll ? "Roll" : isRolling ? "Rolling" : value ? `Rolled ${value}` : "Waiting"}</span>
    </div>
  );
}
