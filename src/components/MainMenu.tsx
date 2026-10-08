import { motion } from "framer-motion";
import { Play, Settings, Sparkles } from "lucide-react";
import { menuVariants } from "../animations/variants";

interface MainMenuProps {
  onPlay: () => void;
  onSettings: () => void;
}

export function MainMenu({ onPlay, onSettings }: MainMenuProps) {
  return (
    <motion.section className="menu-screen" variants={menuVariants} initial="initial" animate="animate" exit="exit">
      <div className="brand-lockup">
        <motion.div
          className="brand-token"
          animate={{ rotate: [0, 8, -8, 0], y: [0, -6, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles size={34} />
        </motion.div>
        <h1>Modern Ludo</h1>
        <p>Fast local matches with classic rules, smart AI, animated pieces, and a polished mobile-game feel.</p>
      </div>

      <div className="menu-actions">
        <motion.button className="primary-button large" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} type="button" onClick={onPlay}>
          <Play size={22} />
          Play
        </motion.button>
        <motion.button className="secondary-button large" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} type="button" onClick={onSettings}>
          <Settings size={22} />
          Settings
        </motion.button>
      </div>
    </motion.section>
  );
}
