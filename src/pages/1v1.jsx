/**
 * 1v1.jsx — Mahabharata 1v1 Battle Mode
 * ----------------------------------------
 * A level-based boss-battle progression screen for your Mahabharata web game.
 * Features: Level select, locked/unlocked levels, battle screen, health bars,
 * attack/defend/special mechanics, victory & defeat screens.
 *
 * Drop this file into your project and import it like:
 *   import BattleMode from './1v1';
 *
 * Progress is stored in localStorage under the key "mahabharata_1v1_progress".
 * Replace placeholder logic (attack damage, animations, sounds) with your real systems.
 */

import { useState, useEffect, useCallback, useRef } from "react";

// ─────────────────────────────────────────────
// ENEMY DATA — 8 levels, scaling difficulty
// ─────────────────────────────────────────────
const ENEMIES = [
  {
    id: 1,
    name: "Shakuni",
    title: "The Cunning Gambler",
    role: "Minister of Hastinapur",
    maxHp: 120,
    attack: 12,
    defense: 5,
    specialChance: 0.15, // probability enemy uses special attack
    specialMultiplier: 1.8,
    color: "#c0a060",
    glow: "#ffd700",
    emoji: "🎲",
    lore: "Master of deception, he manipulates fate with cursed dice.",
  },
  {
    id: 2,
    name: "Dushashana",
    title: "The Wrathful Prince",
    role: "Prince of Hastinapur",
    maxHp: 150,
    attack: 16,
    defense: 8,
    specialChance: 0.18,
    specialMultiplier: 1.9,
    color: "#b04040",
    glow: "#ff4444",
    emoji: "⚔️",
    lore: "His brute strength and rage make him a fearsome warrior.",
  },
  {
    id: 3,
    name: "Ashwathama",
    title: "The Immortal Warrior",
    role: "Son of Dronacharya",
    maxHp: 185,
    attack: 20,
    defense: 11,
    specialChance: 0.20,
    specialMultiplier: 2.0,
    color: "#6060c0",
    glow: "#8888ff",
    emoji: "💎",
    lore: "Bearer of the divine gem, blessed with immortality.",
  },
  {
    id: 4,
    name: "Kripacharya",
    title: "The Eternal Guru",
    role: "Royal Teacher",
    maxHp: 220,
    attack: 24,
    defense: 15,
    specialChance: 0.22,
    specialMultiplier: 2.1,
    color: "#408040",
    glow: "#44ff44",
    emoji: "🏹",
    lore: "One of the seven immortals, his wisdom guides his blade.",
  },
  {
    id: 5,
    name: "Karna",
    title: "The Sun's Son",
    role: "King of Anga",
    maxHp: 270,
    attack: 30,
    defense: 18,
    specialChance: 0.25,
    specialMultiplier: 2.3,
    color: "#c07020",
    glow: "#ff9900",
    emoji: "☀️",
    lore: "Born of the Sun, Karna's generosity rivals his might.",
  },
  {
    id: 6,
    name: "Dronacharya",
    title: "The Supreme Teacher",
    role: "Royal Preceptor",
    maxHp: 320,
    attack: 36,
    defense: 22,
    specialChance: 0.28,
    specialMultiplier: 2.4,
    color: "#805020",
    glow: "#cc8833",
    emoji: "🔱",
    lore: "The greatest military teacher, architect of Arjuna's skill.",
  },
  {
    id: 7,
    name: "Bhishma",
    title: "The Grandsire",
    role: "Commander of Kaurava Army",
    maxHp: 400,
    attack: 44,
    defense: 28,
    specialChance: 0.30,
    specialMultiplier: 2.5,
    color: "#2060a0",
    glow: "#4499ff",
    emoji: "🌊",
    lore: "The indestructible patriarch, bound by a terrible vow.",
  },
  {
    id: 8,
    name: "Duryodhana",
    title: "The Kaurava King",
    role: "Crown Prince of Hastinapur",
    maxHp: 500,
    attack: 55,
    defense: 35,
    specialChance: 0.33,
    specialMultiplier: 2.7,
    color: "#800080",
    glow: "#cc00cc",
    emoji: "👑",
    lore: "The final adversary — pride, power, and unyielding ambition.",
  },
];

// ─────────────────────────────────────────────
// PLAYER BASE STATS (Arjuna)
// ─────────────────────────────────────────────
const PLAYER = {
  name: "Arjuna",
  title: "The Supreme Archer",
  maxHp: 300,
  attack: 28,
  defense: 20,
  specialMultiplier: 2.5,
  specialCooldownMax: 3, // turns before special is usable again
  emoji: "🏹",
};

// ─────────────────────────────────────────────
// LOCALSTORAGE HELPERS
// ─────────────────────────────────────────────
const STORAGE_KEY = "mahabharata_1v1_progress";

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { unlockedUpTo: 1 }; // only first level unlocked by default
}

function saveProgress(unlockedUpTo) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ unlockedUpTo }));
  } catch (_) {}
}

// ─────────────────────────────────────────────
// UTILITY: Random integer in [min, max]
// ─────────────────────────────────────────────
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─────────────────────────────────────────────
// STYLES — all inline / CSS-in-JS
// ─────────────────────────────────────────────
const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
`;

const S = {
  // Wrapper injected into <head> for @keyframes & font
  globalStyle: `
    ${FONTS}
    * { box-sizing: border-box; }
    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 12px 2px var(--glow); }
      50% { box-shadow: 0 0 30px 8px var(--glow); }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-8px); }
      40% { transform: translateX(8px); }
      60% { transform: translateX(-5px); }
      80% { transform: translateX(5px); }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes floatDamage {
      0%   { opacity: 1; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(-60px) scale(1.4); }
    }
    @keyframes burnIn {
      from { opacity: 0; letter-spacing: 0.3em; filter: blur(6px); }
      to   { opacity: 1; letter-spacing: 0.05em; filter: blur(0); }
    }
    @keyframes levelCardHover {
      from { transform: translateY(0) scale(1); }
      to   { transform: translateY(-6px) scale(1.03); }
    }
    @keyframes bgEmber {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes victoryBurst {
      0%   { transform: scale(0.5) rotate(-10deg); opacity: 0; }
      60%  { transform: scale(1.15) rotate(4deg); opacity: 1; }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    @keyframes hpDrain {
      from { background-position: 0% 0%; }
      to   { background-position: 100% 0%; }
    }
    @keyframes buttonPress {
      0%   { transform: scale(1); }
      50%  { transform: scale(0.93); }
      100% { transform: scale(1); }
    }
  `,

  root: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0600 0%, #1a0a00 40%, #0d0d20 100%)",
    backgroundSize: "400% 400%",
    animation: "bgEmber 12s ease infinite",
    color: "#f0e6c8",
    fontFamily: "'Cinzel', Georgia, serif",
    overflowX: "hidden",
    position: "relative",
  },

  // Decorative background pattern
  bgPattern: {
    position: "fixed",
    inset: 0,
    backgroundImage: `
      radial-gradient(ellipse at 20% 20%, rgba(180,120,0,0.07) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 80%, rgba(100,0,180,0.07) 0%, transparent 60%),
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 40px,
        rgba(255,200,0,0.015) 40px,
        rgba(255,200,0,0.015) 41px
      )
    `,
    pointerEvents: "none",
    zIndex: 0,
  },

  content: {
    position: "relative",
    zIndex: 1,
    padding: "0 0 40px",
  },

  // ── LEVEL SELECT ──────────────────────────────
  levelSelectWrap: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "20px 16px",
  },

  heroHeader: {
    textAlign: "center",
    padding: "40px 20px 30px",
  },

  gameTitle: {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "clamp(1.4rem, 5vw, 3rem)",
    fontWeight: 900,
    background: "linear-gradient(135deg, #ffd700, #ff9900, #ff6600)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "0.05em",
    textShadow: "none",
    marginBottom: 6,
    animation: "burnIn 1s ease forwards",
  },

  gameSubtitle: {
    fontFamily: "'Lora', serif",
    fontSize: "clamp(0.85rem, 2.5vw, 1.1rem)",
    color: "#c8a86e",
    fontStyle: "italic",
    letterSpacing: "0.12em",
    opacity: 0.9,
  },

  sectionLabel: {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "clamp(0.75rem, 2.5vw, 1rem)",
    letterSpacing: "0.25em",
    color: "#c8a86e",
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.8,
  },

  levelGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
    gap: 16,
    marginTop: 10,
  },

  levelCard: (unlocked, color, glow) => ({
    background: unlocked
      ? `linear-gradient(145deg, ${color}22, #000000cc)`
      : "linear-gradient(145deg, #111111, #080808)",
    border: `1.5px solid ${unlocked ? color : "#333"}`,
    borderRadius: 14,
    padding: "20px 16px 18px",
    cursor: unlocked ? "pointer" : "not-allowed",
    opacity: unlocked ? 1 : 0.45,
    position: "relative",
    overflow: "hidden",
    transition: "all 0.25s ease",
    "--glow": glow,
    boxShadow: unlocked ? `0 0 14px 1px ${color}44` : "none",
  }),

  levelCardOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%)",
    borderRadius: 14,
    pointerEvents: "none",
  },

  levelNum: (color) => ({
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "0.7rem",
    color,
    letterSpacing: "0.2em",
    marginBottom: 6,
    opacity: 0.9,
  }),

  levelEnemyEmoji: {
    fontSize: "2.2rem",
    display: "block",
    marginBottom: 8,
    filter: "drop-shadow(0 0 8px rgba(255,200,0,0.4))",
  },

  levelEnemyName: {
    fontFamily: "'Cinzel', serif",
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "#f0e6c8",
    marginBottom: 3,
  },

  levelEnemyTitle: {
    fontFamily: "'Lora', serif",
    fontSize: "0.78rem",
    color: "#c8a86e",
    fontStyle: "italic",
    marginBottom: 12,
  },

  levelHpBadge: (color) => ({
    display: "inline-block",
    background: `${color}33`,
    border: `1px solid ${color}88`,
    borderRadius: 20,
    padding: "2px 10px",
    fontSize: "0.72rem",
    color: "#f0e6c8",
    fontFamily: "'Cinzel', serif",
  }),

  lockIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    fontSize: "1.1rem",
    opacity: 0.5,
  },

  completedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "linear-gradient(135deg, #00c853, #00e676)",
    borderRadius: "50%",
    width: 22,
    height: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    boxShadow: "0 0 8px #00c853",
  },

  // ── BATTLE SCREEN ─────────────────────────────
  battleWrap: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "16px",
    animation: "fadeInUp 0.4s ease forwards",
  },

  battleTopBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
    flexWrap: "wrap",
  },

  backBtn: {
    background: "transparent",
    border: "1px solid #555",
    color: "#c8a86e",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: "0.78rem",
    cursor: "pointer",
    fontFamily: "'Cinzel', serif",
    letterSpacing: "0.08em",
    transition: "all 0.2s",
  },

  battleTitle: {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "clamp(0.9rem, 3vw, 1.3rem)",
    background: "linear-gradient(135deg, #ffd700, #ff9900)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "0.08em",
    textAlign: "center",
    flex: 1,
  },

  // Fighter display cards (player + enemy side by side)
  fightersRow: {
    display: "flex",
    gap: 12,
    marginBottom: 18,
    alignItems: "stretch",
  },

  fighterCard: (color, glow, shaking) => ({
    flex: 1,
    background: `linear-gradient(145deg, ${color}22, #000000ee)`,
    border: `1.5px solid ${color}88`,
    borderRadius: 14,
    padding: "16px 12px",
    textAlign: "center",
    position: "relative",
    "--glow": glow,
    animation: shaking ? "shake 0.4s ease" : "none",
    boxShadow: `0 0 18px 2px ${color}44`,
  }),

  vsText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "1.4rem",
    color: "#ff6600",
    textShadow: "0 0 14px #ff4400",
    flexShrink: 0,
    alignSelf: "center",
    padding: "0 4px",
  },

  fighterEmoji: {
    fontSize: "2.8rem",
    display: "block",
    marginBottom: 6,
    filter: "drop-shadow(0 0 10px rgba(255,200,0,0.5))",
  },

  fighterName: {
    fontFamily: "'Cinzel', serif",
    fontWeight: 700,
    fontSize: "clamp(0.85rem, 2.5vw, 1rem)",
    color: "#f0e6c8",
    marginBottom: 2,
  },

  fighterTitle: {
    fontFamily: "'Lora', serif",
    fontSize: "0.72rem",
    color: "#c8a86e",
    fontStyle: "italic",
    marginBottom: 10,
    lineHeight: 1.3,
  },

  // Health bar container
  hpBarWrap: {
    background: "#1a0000",
    borderRadius: 20,
    height: 10,
    overflow: "hidden",
    border: "1px solid #333",
    marginBottom: 4,
    position: "relative",
  },

  hpBarFill: (pct, color) => ({
    height: "100%",
    width: `${Math.max(0, pct * 100)}%`,
    background: pct > 0.5
      ? `linear-gradient(90deg, ${color}, ${color}cc)`
      : pct > 0.25
      ? "linear-gradient(90deg, #ff9900, #ffcc00)"
      : "linear-gradient(90deg, #cc0000, #ff3300)",
    borderRadius: 20,
    transition: "width 0.4s ease",
    boxShadow: `0 0 8px ${pct > 0.25 ? color : "#cc0000"}`,
  }),

  hpLabel: {
    fontSize: "0.72rem",
    color: "#c8a86e",
    fontFamily: "'Cinzel', serif",
    textAlign: "right",
  },

  // Battle log
  battleLogWrap: {
    background: "rgba(0,0,0,0.55)",
    border: "1px solid #2a2010",
    borderRadius: 10,
    padding: "10px 14px",
    marginBottom: 14,
    minHeight: 58,
    maxHeight: 80,
    overflowY: "auto",
  },

  battleLogLine: (isNew) => ({
    fontFamily: "'Lora', serif",
    fontSize: "0.82rem",
    color: isNew ? "#ffd700" : "#a09070",
    fontStyle: "italic",
    lineHeight: 1.5,
    transition: "color 1s ease",
  }),

  // Action buttons
  actionsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 10,
    marginBottom: 14,
  },

  actionBtn: (variant, disabled) => {
    const configs = {
      attack: {
        bg: "linear-gradient(145deg, #8b0000, #cc2200)",
        border: "#ff4400",
        glow: "#ff2200",
        label: "#fff",
      },
      special: {
        bg: "linear-gradient(145deg, #4a007a, #8800cc)",
        border: "#cc44ff",
        glow: "#aa00ff",
        label: "#fff",
      },
      defend: {
        bg: "linear-gradient(145deg, #004466, #006699)",
        border: "#00aaff",
        glow: "#0088cc",
        label: "#fff",
      },
    };
    const c = configs[variant];
    return {
      background: disabled ? "#1a1a1a" : c.bg,
      border: `1.5px solid ${disabled ? "#333" : c.border}`,
      color: disabled ? "#444" : c.label,
      borderRadius: 10,
      padding: "13px 8px",
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "'Cinzel', serif",
      fontSize: "clamp(0.72rem, 2vw, 0.88rem)",
      fontWeight: 600,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      transition: "all 0.2s",
      boxShadow: disabled ? "none" : `0 0 12px ${c.glow}55`,
      opacity: disabled ? 0.4 : 1,
    };
  },

  actionBtnSub: {
    fontSize: "0.65rem",
    opacity: 0.75,
    display: "block",
    marginTop: 3,
    fontFamily: "'Lora', serif",
    fontStyle: "italic",
    fontWeight: 400,
    textTransform: "none",
    letterSpacing: 0,
  },

  // Bottom control row
  controlRow: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
  },

  controlBtn: (variant) => {
    const styles = {
      restart: {
        bg: "linear-gradient(145deg, #332200, #664400)",
        border: "#cc8800",
        color: "#ffd700",
      },
      back: {
        bg: "transparent",
        border: "#555",
        color: "#c8a86e",
      },
    };
    const c = styles[variant];
    return {
      background: c.bg,
      border: `1.5px solid ${c.border}`,
      color: c.color,
      borderRadius: 8,
      padding: "9px 18px",
      cursor: "pointer",
      fontFamily: "'Cinzel', serif",
      fontSize: "0.78rem",
      letterSpacing: "0.08em",
      transition: "all 0.2s",
    };
  },

  // Turn indicator
  turnBadge: (isPlayer) => ({
    display: "inline-block",
    background: isPlayer
      ? "linear-gradient(90deg, #ffd700, #ff9900)"
      : "linear-gradient(90deg, #cc0000, #880000)",
    borderRadius: 20,
    padding: "3px 12px",
    fontSize: "0.72rem",
    fontFamily: "'Cinzel', serif",
    color: "#fff",
    letterSpacing: "0.1em",
    marginBottom: 10,
    boxShadow: isPlayer ? "0 0 10px #ff990088" : "0 0 10px #cc000088",
  }),

  // ── OVERLAY SCREENS (Victory / Defeat) ───────
  overlayWrap: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.88)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 20,
  },

  overlayCard: (isVictory) => ({
    background: isVictory
      ? "linear-gradient(145deg, #001a00, #003300)"
      : "linear-gradient(145deg, #1a0000, #330000)",
    border: `2px solid ${isVictory ? "#00c853" : "#cc0000"}`,
    borderRadius: 20,
    padding: "40px 32px",
    textAlign: "center",
    maxWidth: 420,
    width: "100%",
    boxShadow: `0 0 40px ${isVictory ? "#00c85355" : "#cc000055"}`,
    animation: "victoryBurst 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
  }),

  overlayEmoji: {
    fontSize: "4rem",
    display: "block",
    marginBottom: 10,
    filter: "drop-shadow(0 0 16px rgba(255,200,0,0.6))",
  },

  overlayTitle: (isVictory) => ({
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
    fontWeight: 900,
    background: isVictory
      ? "linear-gradient(135deg, #00e676, #ffd700)"
      : "linear-gradient(135deg, #ff3300, #cc0000)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: 8,
    letterSpacing: "0.05em",
  }),

  overlaySubtitle: {
    fontFamily: "'Lora', serif",
    fontSize: "0.95rem",
    color: "#c8a86e",
    fontStyle: "italic",
    marginBottom: 24,
    lineHeight: 1.5,
  },

  overlayBtnRow: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
  },

  overlayBtn: (variant) => {
    const styles = {
      primary: {
        bg: "linear-gradient(145deg, #ffd700, #cc8800)",
        border: "#ffd700",
        color: "#000",
      },
      secondary: {
        bg: "transparent",
        border: "#666",
        color: "#c8a86e",
      },
    };
    const c = styles[variant];
    return {
      background: c.bg,
      border: `1.5px solid ${c.border}`,
      color: c.color,
      borderRadius: 10,
      padding: "11px 22px",
      cursor: "pointer",
      fontFamily: "'Cinzel', serif",
      fontSize: "0.88rem",
      fontWeight: 600,
      letterSpacing: "0.08em",
      transition: "all 0.2s",
      boxShadow: variant === "primary" ? "0 0 16px #ffd70066" : "none",
    };
  },

  // Floating damage number
  floatingDmg: (x, y, color) => ({
    position: "fixed",
    left: x,
    top: y,
    color,
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "1.5rem",
    fontWeight: 900,
    pointerEvents: "none",
    zIndex: 200,
    textShadow: `0 0 12px ${color}`,
    animation: "floatDamage 1s ease forwards",
    whiteSpace: "nowrap",
  }),

  // Special cooldown display
  cooldownRow: {
    display: "flex",
    gap: 4,
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 2,
  },

  cooldownDot: (filled) => ({
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: filled ? "#aa44ff" : "#222",
    border: "1px solid #666",
    transition: "background 0.3s",
    boxShadow: filled ? "0 0 6px #aa44ff" : "none",
  }),
};

// ─────────────────────────────────────────────
// FLOATING DAMAGE COMPONENT
// ─────────────────────────────────────────────
function FloatingDamage({ damages, onRemove }) {
  useEffect(() => {
    damages.forEach((d) => {
      const t = setTimeout(() => onRemove(d.id), 1000);
      return () => clearTimeout(t);
    });
  }, [damages, onRemove]);

  return (
    <>
      {damages.map((d) => (
        <div key={d.id} style={S.floatingDmg(d.x, d.y, d.color)}>
          {d.text}
        </div>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────
// HEALTH BAR COMPONENT
// ─────────────────────────────────────────────
function HealthBar({ current, max, color }) {
  const pct = current / max;
  return (
    <div>
      <div style={S.hpBarWrap}>
        <div style={S.hpBarFill(pct, color)} />
      </div>
      <div style={S.hpLabel}>
        {Math.max(0, current)} / {max}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LEVEL CARD COMPONENT
// ─────────────────────────────────────────────
function LevelCard({ enemy, unlocked, completed, onSelect }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...S.levelCard(unlocked, enemy.color, enemy.glow),
        transform: hovered && unlocked ? "translateY(-6px) scale(1.03)" : "none",
      }}
      onClick={() => unlocked && onSelect(enemy)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={S.levelCardOverlay} />
      {!unlocked && <span style={S.lockIcon}>🔒</span>}
      {completed && <div style={S.completedBadge}>✓</div>}

      <div style={S.levelNum(enemy.color)}>LEVEL {enemy.id}</div>
      <span style={S.levelEnemyEmoji}>{enemy.emoji}</span>
      <div style={S.levelEnemyName}>{enemy.name}</div>
      <div style={S.levelEnemyTitle}>{enemy.title}</div>
      <span style={S.levelHpBadge(enemy.color)}>❤️ {enemy.maxHp} HP</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// BATTLE SCREEN COMPONENT
// ─────────────────────────────────────────────
function BattleScreen({ enemy, onVictory, onBack }) {
  // ── State ──
  const [playerHp, setPlayerHp] = useState(PLAYER.maxHp);
  const [enemyHp, setEnemyHp] = useState(enemy.maxHp);
  const [turn, setTurn] = useState("player"); // "player" | "enemy"
  const [log, setLog] = useState([`⚔️ The battle against ${enemy.name} begins!`]);
  const [isDefending, setIsDefending] = useState(false);
  const [specialCooldown, setSpecialCooldown] = useState(0);
  const [outcome, setOutcome] = useState(null); // null | "victory" | "defeat"
  const [shakePlayer, setShakePlayer] = useState(false);
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [damages, setDamages] = useState([]);
  const [actionLocked, setActionLocked] = useState(false);
  const dmgIdRef = useRef(0);
  const playerCardRef = useRef(null);
  const enemyCardRef = useRef(null);

  // Add a line to the battle log
  const addLog = useCallback((msg) => {
    setLog((prev) => [...prev.slice(-4), msg]);
  }, []);

  // Spawn a floating damage number at a card's position
  const spawnDamage = useCallback((ref, text, color) => {
    const el = ref?.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const id = ++dmgIdRef.current;
    const x = rect.left + rect.width / 2 - 20;
    const y = rect.top + rect.height * 0.3;
    setDamages((prev) => [...prev, { id, x, y, text, color }]);
  }, []);

  const removeDamage = useCallback((id) => {
    setDamages((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // Check win/loss conditions
  const checkOutcome = useCallback((pHp, eHp) => {
    if (eHp <= 0) return "victory";
    if (pHp <= 0) return "defeat";
    return null;
  }, []);

  // ── Enemy AI turn ──
  const enemyTurn = useCallback(
    (currentPlayerHp, currentEnemyHp, currentDefending) => {
      setTurn("enemy");
      setActionLocked(true);

      setTimeout(() => {
        const isSpecial = Math.random() < enemy.specialChance;
        let raw = randInt(
          Math.floor(enemy.attack * 0.8),
          Math.floor(enemy.attack * 1.2)
        );
        if (isSpecial) raw = Math.floor(raw * enemy.specialMultiplier);

        // Apply player defend
        const reduced = currentDefending ? Math.floor(raw * 0.35) : raw;
        const dmgDealt = Math.max(1, reduced - randInt(0, Math.floor(PLAYER.defense * 0.3)));

        const newPHp = Math.max(0, currentPlayerHp - dmgDealt);

        const msg = isSpecial
          ? `⚡ ${enemy.name} unleashes a special attack! ${PLAYER.name} takes ${dmgDealt} damage!`
          : `🗡️ ${enemy.name} strikes! ${PLAYER.name} takes ${dmgDealt} damage!`;
        addLog(msg);

        setShakePlayer(true);
        spawnDamage(playerCardRef, `-${dmgDealt}`, "#ff3300");
        setTimeout(() => setShakePlayer(false), 450);

        setPlayerHp(newPHp);
        setIsDefending(false);

        const result = checkOutcome(newPHp, currentEnemyHp);
        if (result) {
          setTimeout(() => setOutcome(result), 300);
        } else {
          setTurn("player");
        }
        setActionLocked(false);
      }, 900);
    },
    [enemy, addLog, spawnDamage, checkOutcome]
  );

  // ── Player: Normal Attack ──
  const handleAttack = useCallback(() => {
    if (actionLocked || turn !== "player" || outcome) return;
    setActionLocked(true);
    setIsDefending(false);

    const base = randInt(
      Math.floor(PLAYER.attack * 0.85),
      Math.floor(PLAYER.attack * 1.2)
    );
    const dmg = Math.max(1, base - randInt(0, Math.floor(enemy.defense * 0.4)));
    const newEHp = Math.max(0, enemyHp - dmg);

    addLog(`🏹 ${PLAYER.name} fires an arrow! ${enemy.name} takes ${dmg} damage!`);
    setShakeEnemy(true);
    spawnDamage(enemyCardRef, `-${dmg}`, "#ffd700");
    setTimeout(() => setShakeEnemy(false), 450);
    setEnemyHp(newEHp);

    const result = checkOutcome(playerHp, newEHp);
    if (result) {
      setTimeout(() => setOutcome(result), 300);
      setActionLocked(false);
      return;
    }

    if (specialCooldown > 0) setSpecialCooldown((c) => c - 1);
    setTimeout(() => enemyTurn(playerHp, newEHp, false), 600);
  }, [actionLocked, turn, outcome, enemyHp, playerHp, enemy, addLog, spawnDamage, checkOutcome, specialCooldown, enemyTurn]);

  // ── Player: Special Attack ──
  const handleSpecial = useCallback(() => {
    if (actionLocked || turn !== "player" || outcome || specialCooldown > 0) return;
    setActionLocked(true);
    setIsDefending(false);

    const base = randInt(
      Math.floor(PLAYER.attack * 1.0),
      Math.floor(PLAYER.attack * 1.3)
    );
    const dmg = Math.max(1, Math.floor(base * PLAYER.specialMultiplier) - Math.floor(enemy.defense * 0.2));
    const newEHp = Math.max(0, enemyHp - dmg);

    addLog(`✨ ${PLAYER.name} invokes Gandiva's divine power! ${enemy.name} is struck for ${dmg} damage!`);
    setShakeEnemy(true);
    spawnDamage(enemyCardRef, `⚡-${dmg}`, "#aa44ff");
    setTimeout(() => setShakeEnemy(false), 450);
    setEnemyHp(newEHp);
    setSpecialCooldown(PLAYER.specialCooldownMax);

    const result = checkOutcome(playerHp, newEHp);
    if (result) {
      setTimeout(() => setOutcome(result), 300);
      setActionLocked(false);
      return;
    }

    setTimeout(() => enemyTurn(playerHp, newEHp, false), 600);
  }, [actionLocked, turn, outcome, specialCooldown, enemyHp, playerHp, enemy, addLog, spawnDamage, checkOutcome, enemyTurn]);

  // ── Player: Defend ──
  const handleDefend = useCallback(() => {
    if (actionLocked || turn !== "player" || outcome) return;
    setActionLocked(true);
    setIsDefending(true);
    addLog(`🛡️ ${PLAYER.name} raises his guard, ready to deflect the coming blow!`);
    if (specialCooldown > 0) setSpecialCooldown((c) => c - 1);
    setTimeout(() => enemyTurn(playerHp, enemyHp, true), 600);
  }, [actionLocked, turn, outcome, playerHp, enemyHp, addLog, specialCooldown, enemyTurn]);

  // ── Restart ──
  const handleRestart = useCallback(() => {
    setPlayerHp(PLAYER.maxHp);
    setEnemyHp(enemy.maxHp);
    setTurn("player");
    setLog([`⚔️ The battle against ${enemy.name} begins anew!`]);
    setIsDefending(false);
    setSpecialCooldown(0);
    setOutcome(null);
    setActionLocked(false);
    setDamages([]);
  }, [enemy]);

  return (
    <div style={S.battleWrap}>
      {/* Floating damage numbers */}
      <FloatingDamage damages={damages} onRemove={removeDamage} />

      {/* Top bar */}
      <div style={S.battleTopBar}>
        <button style={S.backBtn} onClick={onBack}>← Select Level</button>
        <div style={S.battleTitle}>⚔️ Level {enemy.id} Battle</div>
        <div style={{ width: 90 }} />
      </div>

      {/* Turn indicator */}
      <div style={{ textAlign: "center" }}>
        <span style={S.turnBadge(turn === "player")}>
          {turn === "player" ? "YOUR TURN" : `${enemy.name.toUpperCase()}'S TURN`}
        </span>
      </div>

      {/* Fighter cards row */}
      <div style={S.fightersRow}>
        {/* Player */}
        <div ref={playerCardRef} style={S.fighterCard("#c8a86e", "#ffd700", shakePlayer)}>
          <span style={S.fighterEmoji}>{PLAYER.emoji}</span>
          <div style={S.fighterName}>{PLAYER.name}</div>
          <div style={S.fighterTitle}>{PLAYER.title}</div>
          <HealthBar current={playerHp} max={PLAYER.maxHp} color="#ffd700" />
          {isDefending && (
            <div style={{ fontSize: "0.72rem", color: "#00aaff", marginTop: 6, fontStyle: "italic", fontFamily: "'Lora', serif" }}>
              🛡️ Defending…
            </div>
          )}
        </div>

        <div style={S.vsText}>VS</div>

        {/* Enemy */}
        <div ref={enemyCardRef} style={S.fighterCard(enemy.color, enemy.glow, shakeEnemy)}>
          <span style={S.fighterEmoji}>{enemy.emoji}</span>
          <div style={S.fighterName}>{enemy.name}</div>
          <div style={S.fighterTitle}>{enemy.title}</div>
          <HealthBar current={enemyHp} max={enemy.maxHp} color={enemy.color} />
        </div>
      </div>

      {/* Battle log */}
      <div style={S.battleLogWrap}>
        {log.map((line, i) => (
          <div key={i} style={S.battleLogLine(i === log.length - 1)}>
            {line}
          </div>
        ))}
      </div>

      {/* Special cooldown indicator */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{ fontSize: "0.68rem", color: "#9977cc", fontFamily: "'Cinzel', serif", letterSpacing: "0.1em", marginBottom: 4 }}>
          {specialCooldown > 0
            ? `SPECIAL READY IN ${specialCooldown} TURN${specialCooldown > 1 ? "S" : ""}`
            : "SPECIAL READY"}
        </div>
        <div style={S.cooldownRow}>
          {Array.from({ length: PLAYER.specialCooldownMax }).map((_, i) => (
            <div key={i} style={S.cooldownDot(i >= specialCooldown)} />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={S.actionsRow}>
        <button
          style={S.actionBtn("attack", actionLocked || turn !== "player")}
          onClick={handleAttack}
          disabled={actionLocked || turn !== "player"}
        >
          ⚔️ Attack
          <span style={S.actionBtnSub}>Normal strike</span>
        </button>
        <button
          style={S.actionBtn("special", actionLocked || turn !== "player" || specialCooldown > 0)}
          onClick={handleSpecial}
          disabled={actionLocked || turn !== "player" || specialCooldown > 0}
        >
          ✨ Special
          <span style={S.actionBtnSub}>Gandiva Divine</span>
        </button>
        <button
          style={S.actionBtn("defend", actionLocked || turn !== "player")}
          onClick={handleDefend}
          disabled={actionLocked || turn !== "player"}
        >
          🛡️ Defend
          <span style={S.actionBtnSub}>Reduce damage</span>
        </button>
      </div>

      {/* Control row */}
      <div style={S.controlRow}>
        <button style={S.controlBtn("restart")} onClick={handleRestart}>
          ↺ Restart Level
        </button>
      </div>

      {/* Victory / Defeat overlay */}
      {outcome && (
        <div style={S.overlayWrap}>
          <div style={S.overlayCard(outcome === "victory")}>
            <span style={S.overlayEmoji}>
              {outcome === "victory" ? "🏆" : "💀"}
            </span>
            <div style={S.overlayTitle(outcome === "victory")}>
              {outcome === "victory" ? "Dharma Triumphs!" : "Defeated!"}
            </div>
            <div style={S.overlaySubtitle}>
              {outcome === "victory"
                ? `${enemy.name} has been vanquished. Your path on the Kurukshetra advances.`
                : `${enemy.name} proved too powerful. Rally your strength and try once more.`}
            </div>
            <div style={S.overlayBtnRow}>
              {outcome === "victory" ? (
                <>
                  <button style={S.overlayBtn("primary")} onClick={onVictory}>
                    Next Level →
                  </button>
                  <button style={S.overlayBtn("secondary")} onClick={onBack}>
                    Level Select
                  </button>
                </>
              ) : (
                <>
                  <button style={S.overlayBtn("primary")} onClick={handleRestart}>
                    ↺ Retry
                  </button>
                  <button style={S.overlayBtn("secondary")} onClick={onBack}>
                    Level Select
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// LEVEL SELECT SCREEN COMPONENT
// ─────────────────────────────────────────────
function LevelSelectScreen({ unlockedUpTo, completedLevels, onSelectLevel }) {
  return (
    <div style={S.levelSelectWrap}>
      {/* Hero header */}
      <div style={S.heroHeader}>
        <div style={S.gameTitle}>KURUKSHETRA</div>
        <div style={S.gameSubtitle}>
          — 1v1 Battle Mode — The Path of the Pandava Archer —
        </div>
      </div>

      <div style={S.sectionLabel}>⚔ Choose Your Battle ⚔</div>

      {/* Level grid */}
      <div style={S.levelGrid}>
        {ENEMIES.map((enemy) => (
          <LevelCard
            key={enemy.id}
            enemy={enemy}
            unlocked={enemy.id <= unlockedUpTo}
            completed={completedLevels.includes(enemy.id)}
            onSelect={onSelectLevel}
          />
        ))}
      </div>

      {/* Progress footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: 32,
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          fontSize: "0.82rem",
          color: "#806040",
          opacity: 0.8,
        }}
      >
        {completedLevels.length === 0
          ? "Begin your journey on the great battlefield."
          : completedLevels.length === ENEMIES.length
          ? "🏆 All enemies defeated. Dharma is restored."
          : `${completedLevels.length} of ${ENEMIES.length} warriors vanquished.`}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN EXPORT — BattleMode (1v1)
// ─────────────────────────────────────────────
export default function BattleMode() {
  // ── Global state ──
  const [screen, setScreen] = useState("levelSelect"); // "levelSelect" | "battle"
  const [activeEnemy, setActiveEnemy] = useState(null);
  const [unlockedUpTo, setUnlockedUpTo] = useState(1);
  const [completedLevels, setCompletedLevels] = useState([]);

  // Inject global styles once on mount
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = S.globalStyle;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  // Load progress from localStorage on mount
  useEffect(() => {
    const progress = loadProgress();
    setUnlockedUpTo(progress.unlockedUpTo || 1);
    setCompletedLevels(progress.completedLevels || []);
  }, []);

  // ── Handlers ──
  const handleSelectLevel = useCallback((enemy) => {
    setActiveEnemy(enemy);
    setScreen("battle");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBack = useCallback(() => {
    setActiveEnemy(null);
    setScreen("levelSelect");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleVictory = useCallback(() => {
    if (!activeEnemy) return;

    const nextUnlock = Math.min(ENEMIES.length, activeEnemy.id + 1);
    const newCompleted = completedLevels.includes(activeEnemy.id)
      ? completedLevels
      : [...completedLevels, activeEnemy.id];

    setUnlockedUpTo(nextUnlock);
    setCompletedLevels(newCompleted);

    // Persist to localStorage
    saveProgress(nextUnlock);
    try {
      localStorage.setItem(
        "mahabharata_1v1_progress",
        JSON.stringify({ unlockedUpTo: nextUnlock, completedLevels: newCompleted })
      );
    } catch (_) {}

    // If this was the last level, go back to select; otherwise go to next
    if (activeEnemy.id >= ENEMIES.length) {
      setActiveEnemy(null);
      setScreen("levelSelect");
    } else {
      const nextEnemy = ENEMIES[activeEnemy.id]; // array is 0-indexed, id is 1-indexed
      setActiveEnemy(nextEnemy);
      // Stays on "battle" screen, component re-mounts with new key
    }
  }, [activeEnemy, completedLevels]);

  return (
    <div style={S.root}>
      {/* Decorative background */}
      <div style={S.bgPattern} />

      <div style={S.content}>
        {screen === "levelSelect" && (
          <LevelSelectScreen
            unlockedUpTo={unlockedUpTo}
            completedLevels={completedLevels}
            onSelectLevel={handleSelectLevel}
          />
        )}

        {screen === "battle" && activeEnemy && (
          /*
           * Using key={activeEnemy.id} forces a full remount when switching levels,
           * cleanly resetting all battle state without extra reset logic.
           */
          <BattleScreen
            key={activeEnemy.id}
            enemy={activeEnemy}
            onVictory={handleVictory}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}

/*
 * ─────────────────────────────────────────────
 * FUTURE EXTENSION POINTS (replace placeholders)
 * ─────────────────────────────────────────────
 *
 * 1. CHARACTERS / SPRITES
 *    Replace the emoji in PLAYER.emoji and ENEMIES[n].emoji with <img> or
 *    animated sprite components. Pass them into the fighter card area.
 *
 * 2. ATTACK ANIMATIONS
 *    In handleAttack / handleSpecial / enemyTurn, trigger your animation
 *    system (CSS keyframes, GSAP, Framer Motion) before or during the
 *    setTimeout delay.
 *
 * 3. SOUND EFFECTS
 *    Add new Audio(...).play() calls at each attack / victory / defeat event.
 *    Example:
 *      const hitSound = new Audio('/sounds/hit.mp3');
 *      hitSound.play();
 *
 * 4. REAL DAMAGE FORMULAS
 *    Replace the randInt logic in handleAttack / handleSpecial / enemyTurn
 *    with your own RPG combat system (e.g., stat modifiers, status effects).
 *
 * 5. SPECIAL ATTACK VARIETY
 *    Each enemy can have a named special in its ENEMIES entry, and you can
 *    route to different VFX / damage functions based on enemy.id.
 *
 * 6. STATUS EFFECTS (burn, stun, etc.)
 *    Add a statusEffects: [] array to battle state and apply/tick them at
 *    the start of each turn.
 *
 * 7. MUSIC
 *    Start/stop background music tracks on screen transitions.
 *    Swap tracks between levelSelect and battle screens.
 * ─────────────────────────────────────────────
 */
