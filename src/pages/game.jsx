import { useEffect, useState, useRef } from "react";

import arjunaImg from "./arjuna.png";
import upgradedArjunaImg from "./upgraded-arjuna.png";
import enemyImg from "./enemy.png";
import dushashanaImg from "./dushashana.png";
import arrowStraightImg from "./arrow-straight.png";
import karnaImg from "./karna.png";
import krishnaImg from "./krishna.png";
import krishnaVideo from "./krishna.webm";
import bgImg from "./background.png";

// Special Videos - place these files in the same folder as Game.jsx
import bhishmaVideo from "./bhishma.webm";
import duryodhanaVideo from "./duryodhana.webm";
import karnaVideo from "./karna.webm";

import shootSoundFile from "./shoot.mp3";
import hitSoundFile from "./hit.mp3";
import karnaSoundFile from "./karna.mp3";
import krishnaSoundFile from "./krishna.mp3";
import rapidSoundFile from "./rapid.mp3";
import dushashanaSoundFile from "./dus.mp3";
import duryodhanaEntrySoundFile from "./rapidFire.mp3";
import chakraSoundFile from "./chakra.mp3";
import healthPickupSoundFile from "./health-pickup.mp3";
import bgSoundFile from "./bg.mp3";

// Special Video Component - no fallback image in normal gameplay as requested
function SpecialVideo({ src, alt, style }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      muted
      playsInline
      loop
      style={style}
    />
  );
}

export default function Game() {
  // ── Game State Variables ───────────────────────────────────────────────────
  const [gameState, setGameState] = useState("start");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("arjunaHighScore");
    return saved ? Number(saved) : 0;
  });
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const [lives, setLives] = useState(3);
  const [enemies, setEnemies] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [combo, setCombo] = useState(0);
  const [slowMode, setSlowMode] = useState(false);
  const [healthPickups, setHealthPickups] = useState([]);
  const [chakras, setChakras] = useState([]);

  // Arjuna is fixed at center (movement with keys completely removed as requested)
  const ARJUNA_X = 50;
  const arjunaXRef = useRef(ARJUNA_X);

  // Power-up states
  const [karnaReady, setKarnaReady] = useState(false);
  const [lastKarnaScore, setLastKarnaScore] = useState(0);
  const [showKarna, setShowKarna] = useState(false);
  const [karnaRays, setKarnaRays] = useState([]);

  const [krishnaReady, setKrishnaReady] = useState(false);
  const [lastKrishnaScore, setLastKrishnaScore] = useState(0);
  const [showKrishna, setShowKrishna] = useState(false);
  const [krishnaActive, setKrishnaActive] = useState(false);

  const [rapidFireReady, setRapidFireReady] = useState(false);
  const [lastRapidFireScore, setLastRapidFireScore] = useState(0);
  const [rapidFireActive, setRapidFireActive] = useState(false);

  const [chakraReady, setChakraReady] = useState(false);
  const [lastChakraScore, setLastChakraScore] = useState(0);

  const [isUpgraded, setIsUpgraded] = useState(false);

  // Performance and cleanup refs to prevent lag
  const gameRef = useRef(null);
  const animationRef = useRef(null);
  const slowModeTimeoutRef = useRef(null);
  const karnaTimeoutRef = useRef(null);
  const krishnaTimeoutRef = useRef(null);
  const rapidFireTimeoutRef = useRef(null);
  const newHighScoreTimerRef = useRef(null);

  const krishnaVideoRef = useRef(null);

  const enemiesRef = useRef([]);
  const arrowsRef = useRef([]);
  const healthPickupsRef = useRef([]);
  const chakrasRef = useRef([]);
  const livesRef = useRef(3);
  const krishnaActiveRef = useRef(false);
  const rapidFireActiveRef = useRef(false);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const highScoreSavedRef = useRef(false);

  // Audio references
  const shootSound = useRef(null);
  const hitSound = useRef(null);
  const karnaSound = useRef(null);
  const krishnaSound = useRef(null);
  const rapidSound = useRef(null);
  const dushashanaSound = useRef(null);
  const duryodhanaEntrySound = useRef(null);
  const chakraSound = useRef(null);
  const healthPickupSound = useRef(null);
  const bgMusic = useRef(null);

  // Sync state to refs for fast access in game loop (prevents lag)
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);
  useEffect(() => { arrowsRef.current = arrows; }, [arrows]);
  useEffect(() => { healthPickupsRef.current = healthPickups; }, [healthPickups]);
  useEffect(() => { chakrasRef.current = chakras; }, [chakras]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { krishnaActiveRef.current = krishnaActive; }, [krishnaActive]);
  useEffect(() => { rapidFireActiveRef.current = rapidFireActive; }, [rapidFireActive]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { comboRef.current = combo; }, [combo]);

  // Load all sounds once at component mount
  useEffect(() => {
    shootSound.current = new Audio(shootSoundFile);
    hitSound.current = new Audio(hitSoundFile);
    karnaSound.current = new Audio(karnaSoundFile);
    krishnaSound.current = new Audio(krishnaSoundFile);
    rapidSound.current = new Audio(rapidSoundFile);
    dushashanaSound.current = new Audio(dushashanaSoundFile);
    duryodhanaEntrySound.current = new Audio(duryodhanaEntrySoundFile);
    chakraSound.current = new Audio(chakraSoundFile);
    healthPickupSound.current = new Audio(healthPickupSoundFile);
    bgMusic.current = new Audio(bgSoundFile);
    bgMusic.current.loop = true;
    bgMusic.current.volume = 0.3;

    return () => {
      cancelAnimationFrame(animationRef.current);
      clearTimeout(slowModeTimeoutRef.current);
      clearTimeout(karnaTimeoutRef.current);
      clearTimeout(krishnaTimeoutRef.current);
      clearTimeout(rapidFireTimeoutRef.current);
      clearTimeout(newHighScoreTimerRef.current);
      if (bgMusic.current) bgMusic.current.pause();
    };
  }, []);

  // Auto-hide new high score message after exactly 5 seconds
  useEffect(() => {
    if (isNewHighScore && score > 0) {
      clearTimeout(newHighScoreTimerRef.current);
      newHighScoreTimerRef.current = setTimeout(() => {
        setIsNewHighScore(false);
      }, 5000);
    }
    return () => clearTimeout(newHighScoreTimerRef.current);
  }, [isNewHighScore, score]);

  const playSound = (audioRef) => {
    if (!audioRef?.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  const resetGame = () => {
    cancelAnimationFrame(animationRef.current);
    clearTimeout(slowModeTimeoutRef.current);
    clearTimeout(karnaTimeoutRef.current);
    clearTimeout(krishnaTimeoutRef.current);
    clearTimeout(rapidFireTimeoutRef.current);
    clearTimeout(newHighScoreTimerRef.current);

    setScore(0);
    setIsNewHighScore(false);
    setLives(3);
    setEnemies([]);
    setArrows([]);
    setCombo(0);
    setSlowMode(false);
    setHealthPickups([]);
    setChakras([]);
    setIsUpgraded(false);

    setKarnaReady(false);
    setLastKarnaScore(0);
    setShowKarna(false);
    setKarnaRays([]);

    setKrishnaReady(false);
    setLastKrishnaScore(0);
    setShowKrishna(false);
    setKrishnaActive(false);

    setRapidFireReady(false);
    setLastRapidFireScore(0);
    setRapidFireActive(false);

    setChakraReady(false);
    setLastChakraScore(0);

    arjunaXRef.current = ARJUNA_X;

    livesRef.current = 3;
    enemiesRef.current = [];
    arrowsRef.current = [];
    healthPickupsRef.current = [];
    chakrasRef.current = [];
    krishnaActiveRef.current = false;
    rapidFireActiveRef.current = false;
    scoreRef.current = 0;
    comboRef.current = 0;
    highScoreSavedRef.current = false;

    if (bgMusic.current) {
      bgMusic.current.currentTime = 0;
      bgMusic.current.play().catch(() => {});
    }

    setGameState("playing");
  };

  // Power-up readiness checks
  // Rapid Fire is disabled after 30000 points as Arjuna fires 3 arrows in upgraded mode
  useEffect(() => {
    if (score >= 800 && score - lastKarnaScore >= 800) setKarnaReady(true);
  }, [score, lastKarnaScore]);

  useEffect(() => {
    if (score >= 8000 && score - lastKrishnaScore >= 8000) setKrishnaReady(true);
  }, [score, lastKrishnaScore]);

  useEffect(() => {
    if (score >= 500 && score - lastRapidFireScore >= 500 && !isUpgraded) setRapidFireReady(true);
  }, [score, lastRapidFireScore, isUpgraded]);

  useEffect(() => {
    if (score >= 2000 && score - lastChakraScore >= 2000) setChakraReady(true);
  }, [score, lastChakraScore]);

  useEffect(() => {
    if (score >= 30000 && !isUpgraded) setIsUpgraded(true);
  }, [score, isUpgraded]);

  useEffect(() => {
    if (!isUpgraded) return;
    setRapidFireReady(false);
    setRapidFireActive(false);
    rapidFireActiveRef.current = false;
    clearTimeout(rapidFireTimeoutRef.current);
  }, [isUpgraded]);

  // Spawn enemies with explicit type - Duryodhana more frequent after 15000
  useEffect(() => {
    if (gameState !== "playing") return;

    const spawnInterval = setInterval(() => {
      const currentScore = scoreRef.current;
      const rand = Math.random();

      let hp = 2;
      let type = "normal";
      let isDushashana = false;

      if (currentScore >= 20000 && rand < 0.08) {
        hp = 8;
        type = "bhisma";
      } else if (currentScore >= 15000 && rand < 0.38) {
        hp = 5;
        type = "duryodhana";
      } else if (currentScore >= 3000 && rand < 0.3) {
        hp = 3;
        type = "dushashana";
        isDushashana = true;
      }

      const newEnemy = {
        id: Date.now() + Math.random(),
        x: Math.random() * 80 + 10,
        y: -10,
        speed: 0.07 + Math.random() * 0.08 + currentScore * 0.00003,
        health: hp,
        maxHealth: hp,
        type,
        isDushashana,
        damageFlash: false,
        side: Math.random() > 0.5 ? "left" : "right",
      };

      if (type === "bhisma" || type === "duryodhana") {
        playSound(duryodhanaEntrySound);
      } else if (isDushashana) {
        playSound(dushashanaSound);
      }

      setEnemies((prev) => [...prev, newEnemy]);
    }, 1700);

    return () => clearInterval(spawnInterval);
  }, [gameState]);

  // Main optimized game loop with reliable bottom collision and health pickup logic
  useEffect(() => {
    if (gameState !== "playing") return;

    const loop = () => {
      let newEnemies = [];
      let newArrows = [...arrowsRef.current];
      let newChakras = [...chakrasRef.current];
      let newHealthPickups = [...healthPickupsRef.current];
      let newLives = livesRef.current;
      let scoreGain = 0;
      let newCombo = comboRef.current;

      // Move enemies and check bottom collision reliably
      enemiesRef.current.forEach((enemy) => {
        const updated = {
          ...enemy,
          y: enemy.y + enemy.speed * (slowMode ? 0.5 : 1),
        };

        // Use the visible bottom edge instead of the center point so fast / large enemies
        // still count as passing Arjuna when they visually cross the bottom area.
        const enemyBottom =
          updated.y +
          (enemy.type === "bhisma" ? 10 : enemy.type === "duryodhana" ? 8 : enemy.type === "dushashana" ? 7 : 6);

        if (enemyBottom >= 96) {
          newLives = Math.max(0, newLives - 1);
          newCombo = 0;
        } else {
          newEnemies.push(updated);
        }
      });

      // Move arrows
      newArrows = newArrows
        .map((a) => ({ ...a, x: a.x + a.vx, y: a.y + a.vy }))
        .filter((a) => a.y > -10 && a.x >= -10 && a.x <= 110);

      // Move chakras
      newChakras = newChakras
        .map((c) => ({
          ...c,
          x: c.x + c.vx,
          y: c.y + c.vy,
          rotation: (c.rotation || 0) + 12,
        }))
        .filter((c) => c.y > -10 && c.x >= -10 && c.x <= 110);

      // Move health pickups
      newHealthPickups = newHealthPickups
        .map((h) => ({ ...h, y: h.y + 0.5 }))
        .filter((h) => h.y < 100);

      // Chakra collision with enemies (same side only)
      newChakras = newChakras.filter((chakra) => {
        let hit = false;
        newEnemies = newEnemies.filter((enemy) => {
          const dx = chakra.x - enemy.x;
          const dy = chakra.y - enemy.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 22 && chakra.side === enemy.side) {
            hit = true;
            playSound(hitSound);
            newCombo += 1;
            const baseKillScore = enemy.maxHealth >= 8 ? 100 : enemy.maxHealth === 5 ? 50 : enemy.maxHealth === 3 ? 25 : 10;
            scoreGain += baseKillScore * (1 + newCombo * 0.2);
            return false;
          }
          return true;
        });
        return !hit;
      });

      // Arrow collision with enemies - instant removal on kill
      newArrows = newArrows.filter((arrow) => {
        let hit = false;
        newEnemies = newEnemies
          .map((enemy) => {
            const dx = arrow.x - enemy.x;
            const dy = arrow.y - enemy.y;
            const hitRadius = enemy.maxHealth >= 5 ? 18 : 12;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < hitRadius && enemy.health > 0 && !hit) {
              hit = true;
              playSound(hitSound);
              const newHealth = enemy.health - 1;
              if (newHealth <= 0) {
                newCombo += 1;
                const baseKillScore = enemy.maxHealth >= 8 ? 100 : enemy.maxHealth === 5 ? 50 : enemy.maxHealth === 3 ? 25 : 10;
                scoreGain += baseKillScore * (1 + newCombo * 0.2);
                return null;
              }
              return { ...enemy, health: newHealth, damageFlash: true };
            }
            return enemy;
          })
          .filter(Boolean);
        return !hit;
      });

      // Arrow collision with health pickups - ONLY when lives < 3
      newArrows = newArrows.filter((arrow) => {
        if (newLives >= 3) return true;

        let hitPickup = false;
        newHealthPickups = newHealthPickups.filter((pickup) => {
          const dx = arrow.x - pickup.x;
          const dy = arrow.y - pickup.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 14 && !hitPickup && newLives < 3) {
            hitPickup = true;
            playSound(healthPickupSound);
            newLives = Math.min(3, newLives + 1);
            return false;
          }
          return true;
        });
        return !hitPickup;
      });

      // Walk into health pickup when lives < 3
      newHealthPickups = newHealthPickups.filter((pickup) => {
        const dx = pickup.x - ARJUNA_X;
        const dy = pickup.y - 85;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 16 && newLives < 3) {
          playSound(healthPickupSound);
          newLives = Math.min(3, newLives + 1);
          return false;
        }
        return true;
      });

      // Krishna power clears all enemies
      if (krishnaActiveRef.current && newEnemies.length > 0) {
        newEnemies.forEach((enemy) => {
          newCombo += 1;
          const baseKillScore = enemy.maxHealth >= 8 ? 100 : enemy.maxHealth === 5 ? 50 : enemy.maxHealth === 3 ? 25 : 10;
          scoreGain += baseKillScore * (1 + newCombo * 0.2);
        });
        newEnemies = [];
      }

      // Slow mode on high combo
      if (newCombo >= 5 && !slowMode) {
        setSlowMode(true);
        clearTimeout(slowModeTimeoutRef.current);
        slowModeTimeoutRef.current = setTimeout(() => setSlowMode(false), 2000);
      }

      if (newLives !== livesRef.current) {
        livesRef.current = newLives;
        setLives(newLives);
      }

      if (scoreGain > 0) setScore((s) => s + scoreGain);

      comboRef.current = newCombo;
      setCombo(newCombo);

      // Reset damage flash
      newEnemies = newEnemies.map((e) =>
        e.damageFlash ? { ...e, damageFlash: false } : e
      );

      setEnemies(newEnemies);
      setArrows(newArrows);
      setChakras(newChakras);
      setHealthPickups(newHealthPickups);

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, slowMode]);

  // High score check
  useEffect(() => {
    if (score > highScore) setIsNewHighScore(true);
  }, [score, highScore]);

  // Game over check
  useEffect(() => {
    if (lives <= 0 && !highScoreSavedRef.current) {
      highScoreSavedRef.current = true;

      cancelAnimationFrame(animationRef.current);
      clearTimeout(slowModeTimeoutRef.current);
      clearTimeout(karnaTimeoutRef.current);
      clearTimeout(krishnaTimeoutRef.current);
      clearTimeout(rapidFireTimeoutRef.current);
      clearTimeout(newHighScoreTimerRef.current);

      if (bgMusic.current) {
        bgMusic.current.pause();
        bgMusic.current.currentTime = 0;
      }

      const finalScore = Math.floor(scoreRef.current);
      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem("arjunaHighScore", String(finalScore));
        setIsNewHighScore(true);
      }

      setGameState("gameover");
    }
  }, [lives, highScore]);

  // Power-up functions
  const useKarnaPower = () => {
    if (!karnaReady) return;
    setShowKarna(true);
    setKarnaReady(false);
    setLastKarnaScore(scoreRef.current);
    playSound(karnaSound);

    const rays = Array.from({ length: 12 }).map((_, i) => ({ id: i, angle: i * 30 }));
    setKarnaRays(rays);

    karnaTimeoutRef.current = setTimeout(() => {
      let powerKillScore = 0;
      enemiesRef.current.forEach((e) => {
        powerKillScore += e.maxHealth >= 8 ? 100 : e.maxHealth === 5 ? 50 : e.maxHealth === 3 ? 25 : 10;
      });
      setScore((s) => s + powerKillScore);
      setEnemies([]);
      setShowKarna(false);
      setKarnaRays([]);
    }, 1500);
  };

  const useKrishnaPower = () => {
    if (!krishnaReady) return;
    setShowKrishna(true);
    setKrishnaActive(true);
    setKrishnaReady(false);
    setLastKrishnaScore(scoreRef.current);
    playSound(krishnaSound);

    if (krishnaVideoRef.current) {
      krishnaVideoRef.current.currentTime = 0;
      krishnaVideoRef.current.play().catch(() => {});
    }

    krishnaTimeoutRef.current = setTimeout(() => {
      if (krishnaVideoRef.current) {
        krishnaVideoRef.current.pause();
        krishnaVideoRef.current.currentTime = 0;
      }
      setShowKrishna(false);
      setKrishnaActive(false);
    }, 8000);
  };

  const useRapidFirePower = () => {
    if (!rapidFireReady || isUpgraded) return; // Rapid Fire disabled after 30000 when upgraded
    setRapidFireActive(true);
    setRapidFireReady(false);
    setLastRapidFireScore(scoreRef.current);
    playSound(rapidSound);
    rapidFireTimeoutRef.current = setTimeout(() => setRapidFireActive(false), 5000);
  };

  const useChakraPower = (targetDx, targetDy) => {
    if (!chakraReady) return;
    setChakraReady(false);
    setLastChakraScore(scoreRef.current);
    playSound(chakraSound);

    const targetDist = Math.sqrt(targetDx * targetDx + targetDy * targetDy);
    if (!targetDist) return;

    const vx = (targetDx / targetDist) * 1.4;
    const vy = (targetDy / targetDist) * 1.4;
    const side = targetDx > 0 ? "right" : "left";

    setChakras((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), x: ARJUNA_X, y: 82, vx, vy, rotation: 0, side },
    ]);
  };

  const fireArrow = (originX, targetDx, targetDy) => {
    const targetDist = Math.sqrt(targetDx * targetDx + targetDy * targetDy);
    if (!targetDist) return;
    playSound(shootSound);
    const vx = (targetDx / targetDist) * 1.6;
    const vy = (targetDy / targetDist) * 1.6;
    setArrows((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), x: originX, y: 85, vx, vy },
    ]);
  };

  const shoot = (e) => {
    if (gameState !== "playing" || !gameRef.current) return;

    const rect = gameRef.current.getBoundingClientRect();
    const targetX = ((e.clientX - rect.left) / rect.width) * 100;
    const targetY = ((e.clientY - rect.top) / rect.height) * 100;

    const dx = targetX - ARJUNA_X;
    const dy = targetY - 85;

    if (e.button === 2) {
      useChakraPower(dx, dy);
      return;
    }

    if (rapidFireActiveRef.current && !isUpgraded) {
      const spreadAngle = Math.atan2(dy, dx);
      fireArrow(ARJUNA_X, dx, dy);
      fireArrow(ARJUNA_X, Math.cos(spreadAngle - 0.2) * 100, Math.sin(spreadAngle - 0.2) * 100);
      fireArrow(ARJUNA_X, Math.cos(spreadAngle + 0.2) * 100, Math.sin(spreadAngle + 0.2) * 100);
    } else if (isUpgraded) {
      const spreadAngle = Math.atan2(dy, dx);
      fireArrow(ARJUNA_X, dx, dy);
      fireArrow(ARJUNA_X, Math.cos(spreadAngle - 0.15) * 100, Math.sin(spreadAngle - 0.15) * 100);
      fireArrow(ARJUNA_X, Math.cos(spreadAngle + 0.15) * 100, Math.sin(spreadAngle + 0.15) * 100);
    } else {
      fireArrow(ARJUNA_X, dx, dy);
    }
  };

  // Random health pickup spawn when enemies die
  const lastEnemyCountRef = useRef(0);
  useEffect(() => {
    if (livesRef.current >= 3) {
      lastEnemyCountRef.current = enemies.length;
      return;
    }

    if (enemies.length < lastEnemyCountRef.current && Math.random() < 0.3) {
      const spawnX = Math.random() * 80 + 10;
      const spawnY = Math.random() * 35 + 10;
      setHealthPickups((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), x: spawnX, y: spawnY },
      ]);
    }
    lastEnemyCountRef.current = enemies.length;
  }, [enemies]);

  // Render enemy strictly by explicit type (fixes Bhisma/Duryodhana mixing)
  const renderEnemy = (e) => {
    const width = e.type === "bhisma" ? "130px" : e.type === "duryodhana" ? "110px" : e.type === "dushashana" ? "85px" : "70px";
    const baseFilter = e.damageFlash
      ? "brightness(2) drop-shadow(0 0 10px rgba(255,255,0,0.8))"
      : e.maxHealth > 2
      ? "drop-shadow(0px 0px 15px rgba(255,0,0,0.8))"
      : "drop-shadow(0px 0px 8px rgba(200,0,0,0.6))";

    return (
      <div
        key={e.id}
        style={{
          position: "absolute",
          top: `${e.y}%`,
          left: `${e.x}%`,
          transform: "translate(-50%, -50%)",
          zIndex: 1,
          animation: (e.type === "bhisma" || e.type === "duryodhana")
            ? "boss-drop-in 0.5s cubic-bezier(0.22,1,0.36,1) forwards"
            : "none",
        }}
      >
        {(e.type === "bhisma" || e.type === "duryodhana") ? (
          <SpecialVideo
            src={e.type === "bhisma" ? bhishmaVideo : duryodhanaVideo}
            alt={e.type === "bhisma" ? "Bhishma" : "Duryodhana"}
            style={{
              width,
              display: "block",
              filter: baseFilter,
              transition: "filter 0.1s",
              borderRadius: "8px",
            }}
          />
        ) : e.type === "dushashana" ? (
          <img
            src={dushashanaImg}
            alt="Dushashana"
            draggable="false"
            style={{ width, display: "block", filter: baseFilter, transition: "filter 0.1s" }}
          />
        ) : (
          <img
            src={enemyImg}
            alt="Enemy"
            draggable="false"
            style={{ width, display: "block", filter: baseFilter, transition: "filter 0.1s" }}
          />
        )}

        {/* Health Bar */}
        <div style={{
          width, height: "8px",
          background: "rgba(0,0,0,0.7)", marginTop: "6px",
          borderRadius: "4px", overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.3)",
        }}>
          <div style={{
            width: `${(e.health / e.maxHealth) * 100}%`,
            height: "100%",
            background: "linear-gradient(90deg, #FF4444, #FF0000)",
            transition: "width 0.2s",
            boxShadow: "0 0 8px rgba(255,0,0,0.6)",
          }} />
        </div>
      </div>
    );
  };

  // ── Main Render ────────────────────────────────────────────────────────────
  return (
    <div
      ref={gameRef}
      onClick={shoot}
      onContextMenu={(e) => { e.preventDefault(); shoot(e); }}
      style={{
        height: "100vh",
        width: "100vw",
        position: "relative",
        backgroundImage: `url(${bgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
        color: "white",
        cursor: "crosshair",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <style>{`
        * {
          user-select: none;
          -webkit-user-drag: none;
        }
        img, video {
          user-select: none;
          -webkit-user-drag: none;
          pointer-events: none;
        }
        button {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          border: none;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        button:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.4); }
        button:active:not(:disabled) { transform: translateY(-1px); }

        @keyframes pulse-glow {
          0%, 100% { text-shadow: 0 0 10px rgba(255,215,0,0.5), 0 0 20px rgba(255,215,0,0.3); }
          50% { text-shadow: 0 0 20px rgba(255,215,0,0.8), 0 0 30px rgba(255,215,0,0.5); }
        }
        @keyframes float-pulse {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes boss-drop-in {
          0% { opacity: 0; transform: translate(-50%, -50%) translateY(-60px) scale(0.6); }
          65% { opacity: 1; transform: translate(-50%, -50%) translateY(12px) scale(1.04); }
          100% { transform: translate(-50%, -50%) translateY(0px) scale(1.00); }
        }
        @keyframes krishna-fly-in {
          0% { opacity: 0; transform: translateX(-50%) translateY(-140px) scale(0.55); }
          55% { opacity: 1; transform: translateX(-50%) translateY(14px) scale(1.06); }
          75% { transform: translateX(-50%) translateY(-8px) scale(1.00); }
          100% { transform: translateX(-50%) translateY(0px) scale(1.00); }
        }
        @keyframes krishna-hover {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50% { transform: translateX(-50%) translateY(-14px); }
        }
        @keyframes krishna-glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 18px rgba(0,191,255,0.75)) drop-shadow(0 0 40px rgba(120,230,255,0.35)); }
          50% { filter: drop-shadow(0 0 36px rgba(0,191,255,1.00)) drop-shadow(0 0 70px rgba(120,230,255,0.65)); }
        }
        @keyframes krishna-aura-pulse {
          0%, 100% { opacity: 0.55; transform: translate(-50%,-50%) scale(1.00); }
          50% { opacity: 0.90; transform: translate(-50%,-50%) scale(1.08); }
        }
        @keyframes karna-fly-in {
          0% { opacity: 0; transform: translateX(-50%) translateY(60px) scale(0.7); }
          60% { opacity: 1; transform: translateX(-50%) translateY(-8px) scale(1.05); }
          100% { transform: translateX(-50%) translateY(0px) scale(1.00); }
        }
        @keyframes karna-glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 18px rgba(255,215,0,0.8)) drop-shadow(0 0 40px rgba(255,165,0,0.4)); }
          50% { filter: drop-shadow(0 0 36px rgba(255,215,0,1.00)) drop-shadow(0 0 70px rgba(255,165,0,0.7)); }
        }
        @keyframes health-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>

      {/* ── Start Screen ─────────────────────────────────────────────────────── */}
      {gameState === "start" && (
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(139,69,19,0.4))",
            backdropFilter: "blur(5px)",
          }}
        >
          <div style={{ marginBottom: "30px" }}>
            <h1 style={{
              fontSize: "72px", margin: "0 0 20px 0",
              background: "linear-gradient(135deg, #FFD700, #FFA500)",
              backgroundClip: "text", WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent", fontWeight: 900, letterSpacing: "3px",
            }}>
              🏹 ARJUNA BATTLE
            </h1>
            <p style={{ fontSize: "24px", margin: "20px 0", color: "#FFD700", fontWeight: 600, textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
              Defend your land from the demon hordes
            </p>
          </div>

          <div style={{
            background: "rgba(0,0,0,0.5)", border: "3px solid #FFD700",
            borderRadius: "15px", padding: "25px 40px", marginBottom: "30px",
            boxShadow: "0 8px 32px rgba(255,215,0,0.2)",
          }}>
            <p style={{ fontSize: "20px", margin: "10px 0", color: "#FFF" }}>
              High Score: <span style={{ fontSize: "28px", color: "#FFD700", fontWeight: "bold" }}>{highScore}</span>
            </p>
            <div style={{ fontSize: "14px", color: "#CCC", marginTop: "15px", lineHeight: "1.8" }}>
              <p>⚡ Call Karna at 800 points</p>
              <p>🦚 Call Krishna at 8000 points</p>
              <p>🏹 Rapid Fire at 500 points (disabled after 30000)</p>
              <p>💫 Chakra Power at 2000 points (Right Click)</p>
              <p>💚 Health Pickups appear randomly (shoot when lives &lt; 3)</p>
              <p>✨ Upgraded Arjuna at 30000 points (fires 3 arrows)</p>
              <p>Arjuna is fixed at center</p>
            </div>
          </div>

          <button
            onClick={resetGame}
            style={{
              padding: "16px 50px", fontSize: "24px", fontWeight: "bold",
              background: "linear-gradient(135deg, #FFD700, #FFA500)",
              color: "black", borderRadius: "12px", cursor: "pointer", letterSpacing: "1px",
            }}
          >
            ⚔️ START GAME
          </button>
        </div>
      )}

      {/* ── Playing Screen ───────────────────────────────────────────────────── */}
      {gameState === "playing" && (
        <>
          {/* Translucent Scoreboard with clear text */}
          <div style={{
            position: "absolute", top: "15px", left: "15px",
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(12px)",
            border: "2px solid rgba(255, 215, 0, 0.7)",
            borderRadius: "15px",
            padding: "20px 30px",
            zIndex: 20,
            minWidth: "380px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "14px", color: "#ddd", display: "block", marginBottom: "4px" }}>SCORE</span>
                <span style={{ fontSize: "32px", fontWeight: "bold", color: "#FFD700" }}>{Math.floor(score).toLocaleString()}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "14px", color: "#ddd", display: "block", marginBottom: "4px" }}>HIGH SCORE</span>
                <span style={{ fontSize: "28px", fontWeight: "bold", color: "#FFB347" }}>{highScore.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
              <div>
                <span style={{ fontSize: "14px", color: "#ddd", display: "block", marginBottom: "4px" }}>COMBO</span>
                <span style={{ fontSize: "24px", fontWeight: "bold", color: combo > 0 ? "#00FF88" : "#999" }}>x{combo}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "14px", color: "#ddd", display: "block", marginBottom: "4px" }}>LIVES</span>
                <span style={{ fontSize: "28px", fontWeight: "bold", color: "#FF6B6B" }}>{"❤️".repeat(Math.max(0, lives))}</span>
              </div>
            </div>
          </div>

          {/* New High Score Alert - auto hides after 5s */}
          {isNewHighScore && score > 0 && (
            <div style={{
              position: "absolute", top: "20px", left: "50%",
              transform: "translateX(-50%)", zIndex: 21,
              fontSize: "28px", fontWeight: "bold", color: "#FFD700",
              textShadow: "0 0 20px rgba(255,215,0,0.8), 0 0 40px rgba(255,165,0,0.6)",
              animation: "pulse-glow 1s infinite",
            }}>
              🔥 NEW HIGH SCORE! 🔥
            </div>
          )}

          {/* Power Ups Panel */}
          <div style={{
            position: "absolute", right: "20px", top: "20px",
            display: "flex", flexDirection: "column", gap: "12px", zIndex: 20,
          }}>
            {isUpgraded && (
              <div style={{
                background: "linear-gradient(135deg, rgba(100,200,255,0.3), rgba(0,150,255,0.3))",
                border: "2px solid #00BFFF", borderRadius: "10px", padding: "10px 15px",
                textAlign: "center", fontWeight: "bold", fontSize: "13px", color: "#00BFFF",
                boxShadow: "0 0 15px rgba(0,191,255,0.3)", animation: "float-pulse 2s ease-in-out infinite",
              }}>
                ✨ UPGRADED MODE (3 Arrows)
              </div>
            )}
            {karnaReady && (
              <button
                onClick={(e) => { e.stopPropagation(); useKarnaPower(); }}
                style={{
                  padding: "12px 18px", background: "linear-gradient(135deg, #FFD700, #FFA500)",
                  color: "black", fontWeight: "bold", borderRadius: "10px",
                  cursor: "pointer", fontSize: "13px",
                }}
              >
                ⚡ CALL KARNA
              </button>
            )}
            {krishnaReady && (
              <button
                onClick={(e) => { e.stopPropagation(); useKrishnaPower(); }}
                style={{
                  padding: "12px 18px", background: "linear-gradient(135deg, #00BFFF, #0090FF)",
                  color: "white", fontWeight: "bold", borderRadius: "10px",
                  cursor: "pointer", fontSize: "13px",
                }}
              >
                🦚 CALL KRISHNA
              </button>
            )}
            {rapidFireReady && !isUpgraded && (
              <button
                onClick={(e) => { e.stopPropagation(); useRapidFirePower(); }}
                style={{
                  padding: "12px 18px", background: "linear-gradient(135deg, #00FF00, #32CD32)",
                  color: "black", fontWeight: "bold", borderRadius: "10px",
                  cursor: "pointer", fontSize: "13px",
                }}
              >
                🏹 RAPID FIRE
              </button>
            )}
            {chakraReady && (
              <div style={{
                background: "linear-gradient(135deg, rgba(200,100,255,0.3), rgba(150,50,255,0.3))",
                border: "2px solid #DA70D6", borderRadius: "10px", padding: "10px 15px",
                textAlign: "center", fontWeight: "bold", fontSize: "12px", color: "#DA70D6",
                boxShadow: "0 0 15px rgba(218,112,214,0.3)",
              }}>
                💫 CHAKRA READY (Right Click)
              </div>
            )}
          </div>

          {/* Karna Power Visualization */}
          {showKarna && karnaRays.map((ray) => (
            <div
              key={ray.id}
              style={{
                position: "absolute", bottom: "10%", left: "50%",
                width: "6px", height: "250px",
                background: "linear-gradient(to top, #FFD700, rgba(255,215,0,0))",
                transform: `translateX(-50%) rotate(${ray.angle}deg)`,
                transformOrigin: "bottom", opacity: 0.8, zIndex: 9,
                boxShadow: "0 0 20px rgba(255,215,0,0.8)",
              }}
            />
          ))}

          {showKarna && (
            <div style={{
              position: "absolute", bottom: "10%", left: "50%",
              transform: "translateX(-50%)", zIndex: 10, pointerEvents: "none",
            }}>
              <SpecialVideo
                src={karnaVideo}
                alt="Karna"
                style={{ width: "200px", animation: "karna-glow-pulse 1.2s ease-in-out infinite" }}
              />
            </div>
          )}

          {/* Krishna Power */}
          {showKrishna && (
            <div style={{
              position: "absolute",
              bottom: "22%",
              left: `${ARJUNA_X}%`,
              transform: "translateX(-50%)",
              zIndex: 12,
              pointerEvents: "none",
            }}>
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "300px",
                height: "300px",
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
                background: "radial-gradient(circle, rgba(0,191,255,0.22) 0%, rgba(120,230,255,0.10) 55%, transparent 80%)",
                zIndex: -1,
              }} />
              <video
                ref={krishnaVideoRef}
                src={krishnaVideo}
                autoPlay
                muted
                playsInline
                loop
                style={{
                  width: "260px",
                  display: "block",
                  borderRadius: "12px",
                  animation: "krishna-glow-pulse 1.4s ease-in-out infinite",
                }}
              />
            </div>
          )}

          {/* Chakras */}
          {chakras.map((c) => (
            <div key={c.id} style={{
              position: "absolute", top: `${c.y}%`, left: `${c.x}%`,
              width: "40px", height: "40px",
              background: "radial-gradient(circle, #DA70D6, #9932CC)", borderRadius: "50%",
              transform: `translate(-50%, -50%) rotate(${c.rotation}deg)`,
              zIndex: 3, boxShadow: "0 0 20px rgba(218,112,214,0.8)", border: "2px solid #FF00FF",
            }} />
          ))}

          {/* Health Pickups */}
          {healthPickups.map((h) => (
            <div key={h.id} style={{
              position: "absolute", top: `${h.y}%`, left: `${h.x}%`,
              transform: "translate(-50%, -50%)", zIndex: 4,
              animation: "health-bounce 0.6s ease-in-out infinite",
            }}>
              <div style={{
                fontSize: "32px",
                textShadow: lives < 3
                  ? "0 0 15px rgba(0,255,0,1), 0 0 30px rgba(0,255,0,0.7)"
                  : "0 0 10px rgba(100,100,100,0.5)",
              }}>
                💚
              </div>
            </div>
          ))}

          {/* Fixed Arjuna */}
          <img
            src={isUpgraded ? upgradedArjunaImg : arjunaImg}
            alt="Arjuna"
            draggable="false"
            style={{
              position: "absolute",
              bottom: "2%",
              left: `${ARJUNA_X}%`,
              transform: "translateX(-50%)",
              width: isUpgraded ? "240px" : "220px",
              zIndex: 10,
              filter: rapidFireActive
                ? "drop-shadow(0px 0px 20px rgba(0,255,0,0.8))"
                : "none",
              transition: "filter 0.3s ease",
            }}
          />

          {/* Enemies - strictly based on type */}
          {enemies.map(renderEnemy)}

          {/* Arrows */}
          {arrows.map((a) => {
            const angle = Math.atan2(a.vy, a.vx) * (180 / Math.PI);
            return (
              <img
                key={a.id}
                src={arrowStraightImg}
                alt="Arrow"
                draggable="false"
                style={{
                  position: "absolute",
                  top: `${a.y}%`,
                  left: `${a.x}%`,
                  width: "52px",
                  height: "52px",
                  objectFit: "contain",
                  zIndex: 8,
                  pointerEvents: "none",
                  transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
                  transformOrigin: "50% 50%",
                }}
              />
            );
          })}
        </>
      )}

      {/* ── Game Over Screen ─────────────────────────────────────────────────── */}
      {gameState === "gameover" && (
        <div style={{
          position: "absolute", height: "100%", width: "100%",
          background: "linear-gradient(135deg, rgba(0,0,0,0.85), rgba(139,69,19,0.5))",
          backdropFilter: "blur(8px)",
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
          zIndex: 30,
        }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{
              fontSize: "64px", margin: "0 0 30px 0",
              background: "linear-gradient(135deg, #FF6B6B, #FF0000)",
              backgroundClip: "text", WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent", fontWeight: 900, letterSpacing: "2px",
            }}>
              💀 GAME OVER
            </h1>

            <div style={{
              background: "rgba(0,0,0,0.6)", border: "3px solid #FFD700",
              borderRadius: "15px", padding: "40px", marginBottom: "30px",
              boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
            }}>
              <div style={{ marginBottom: "25px" }}>
                <p style={{ fontSize: "18px", color: "#AAA", margin: "0 0 8px 0" }}>FINAL SCORE</p>
                <h2 style={{ fontSize: "48px", color: "#FFD700", margin: 0, fontWeight: "bold" }}>
                  {Math.floor(score).toLocaleString()}
                </h2>
              </div>
              <div style={{ marginBottom: "25px" }}>
                <p style={{ fontSize: "18px", color: "#AAA", margin: "0 0 8px 0" }}>BEST SCORE</p>
                <h2 style={{ fontSize: "42px", color: "#FFB347", margin: 0, fontWeight: "bold" }}>
                  {highScore.toLocaleString()}
                </h2>
              </div>
              {isNewHighScore && (
                <div style={{
                  fontSize: "28px", color: "#FFD700", fontWeight: "bold",
                  marginTop: "25px", animation: "pulse-glow 1s infinite",
                }}>
                  🏆 NEW HIGH SCORE! 🏆
                </div>
              )}
            </div>

            <button
              onClick={resetGame}
              style={{
                padding: "16px 50px", fontSize: "22px", fontWeight: "bold",
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                color: "black", borderRadius: "12px", cursor: "pointer", letterSpacing: "1px",
              }}
            >
              🔄 PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}