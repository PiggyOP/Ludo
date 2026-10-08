import { AnimatePresence, motion } from "framer-motion";
import { Home, RotateCcw, Settings, Volume2, VolumeX } from "lucide-react";
import type { CSSProperties } from "react";
import { useState } from "react";
import { Confetti } from "./components/Confetti";
import { Dice } from "./components/Dice";
import { GameBoard } from "./components/GameBoard";
import { GameSetup } from "./components/GameSetup";
import { MainMenu } from "./components/MainMenu";
import { PlayerPanel } from "./components/PlayerPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { PLAYER_COLORS } from "./gameLogic/constants";
import { useLudoGame } from "./hooks/useLudoGame";

export default function App() {
  const game = useLudoGame();
  const [settingsBackTarget, setSettingsBackTarget] = useState<"menu" | "game">("menu");
  const canRoll = game.screen === "game" && game.state.phase === "awaiting-roll" && game.activePlayer.kind === "human" && !game.isRolling;
  const winner = game.state.winnerId ? game.state.players.find((player) => player.id === game.state.winnerId) : null;

  return (
    <main className="app-shell">
      <AnimatePresence mode="wait">
        {game.screen === "menu" && (
          <MainMenu
            key="menu"
            onPlay={() => game.setScreen("setup")}
            onSettings={() => {
              setSettingsBackTarget("menu");
              game.setScreen("settings");
            }}
          />
        )}

        {game.screen === "setup" && (
          <GameSetup
            key="setup"
            mode={game.mode}
            playerCount={game.playerCount}
            onBack={() => game.setScreen("menu")}
            onModeChange={game.setMode}
            onPlayerCountChange={game.setPlayerCount}
            onStart={game.startGame}
          />
        )}

        {game.screen === "settings" && (
          <SettingsPanel
            key="settings"
            settings={game.settings}
            onBack={() => game.setScreen(settingsBackTarget)}
            onChange={game.setSettings}
          />
        )}

        {game.screen === "game" && (
          <motion.section className="game-layout" key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <header className="game-topbar">
              <button className="icon-button" type="button" aria-label="Main menu" onClick={() => game.setScreen("menu")}>
                <Home size={20} />
              </button>
              <div className="match-title">
                <span>Modern Ludo</span>
                <strong>{game.mode === "pvai" ? "Player vs AI" : "Player vs Player"}</strong>
              </div>
              <div className="topbar-actions">
                <button className="icon-button" type="button" aria-label="Restart match" onClick={game.restart}>
                  <RotateCcw size={20} />
                </button>
                <button
                  className="icon-button"
                  type="button"
                  aria-label={game.settings.muted ? "Unmute sound" : "Mute sound"}
                  onClick={() => game.setSettings((current) => ({ ...current, muted: !current.muted }))}
                >
                  {game.settings.muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Settings"
                  onClick={() => {
                    setSettingsBackTarget("game");
                    game.setScreen("settings");
                  }}
                >
                  <Settings size={20} />
                </button>
              </div>
            </header>

            <section className="play-surface">
              <GameBoard
                activePlayerId={game.activePlayer.id}
                canSelectTokens={game.activePlayer.kind === "human"}
                legalTokenIds={game.legalTokenIds}
                onTokenClick={game.moveToken}
                state={game.state}
              />

              <aside className="side-panel">
                <div className="turn-card" style={{ "--accent": PLAYER_COLORS[game.activePlayer.color].primary } as CSSProperties}>
                  <span className="eyebrow">Turn {game.state.turnNumber}</span>
                  <h2>{game.activePlayer.name}</h2>
                  <p>{game.state.message}</p>
                </div>

                <Dice canRoll={canRoll} isRolling={game.isRolling} value={game.state.diceValue} onRoll={game.roll} />

                <div className="players-list">
                  {game.state.players.map((player) => (
                    <PlayerPanel
                      key={player.id}
                      active={player.id === game.activePlayer.id && game.state.phase !== "finished"}
                      player={player}
                    />
                  ))}
                </div>
              </aside>
            </section>

            <AnimatePresence>
              {winner && (
                <motion.div className="victory-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Confetti />
                  <motion.div
                    className="victory-card"
                    initial={{ scale: 0.8, y: 30, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.94, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                  >
                    <span className="victory-badge" style={{ background: PLAYER_COLORS[winner.color].primary }}>
                      Winner
                    </span>
                    <h2>{winner.name}</h2>
                    <div className="victory-actions">
                      <button className="primary-button" type="button" onClick={game.restart}>
                        Play Again
                      </button>
                      <button className="secondary-button" type="button" onClick={() => game.setScreen("menu")}>
                        Menu
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
