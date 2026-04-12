import { useEffect, useState, useRef } from "react";

import arjunaImg from "./arjuna.png";
import upgradedArjunaImg from "./upgraded-arjuna.png";
import enemyImg from "./enemy.png";
import dushashanaImg from "./dushashana.png";
import duryodhanaImg from "./duryodhana.png";
import arrowLeftImg from "./arrow-left.png";
import arrowStraightImg from "./arrow-straight.png";
import arrowRightImg from "./arrow-right.png";
import arrowDiagLeftImg from "./arrow-diag-left.png";
import arrowDiagRightImg from "./arrow-diag-right.png";
import karnaImg from "./karna.png";
import krishnaImg from "./krishna.png";
import bgImg from "./background.png";
import healthPickupImg from "./health-pickup.png";

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

export default function Game() {
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

  const gameRef = useRef(null);
  const animationRef = useRef(null);
  const slowModeTimeoutRef = useRef(null);
  const karnaTimeoutRef = useRef(null);
  const krishnaTimeoutRef = useRef(null);
  const rapidFireTimeoutRef = useRef(null);

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

  // Sync refs with state
  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);

  useEffect(() => {
    arrowsRef.current = arrows;
  }, [arrows]);

  useEffect(() => {
    healthPickupsRef.current = healthPickups;
  }, [healthPickups]);

  useEffect(() => {
    chakrasRef.current = chakras;
  }, [chakras]);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  useEffect(() => {
    krishnaActiveRef.current = krishnaActive;
  }, [krishnaActive]);

  useEffect(() => {
    rapidFireActiveRef.current = rapidFireActive;
  }, [rapidFireActive]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  // Load sounds
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
      if (bgMusic.current) {
        bgMusic.current.pause();
      }
    };
  }, []);

  const playSound = (audioRef) => {
    if (!audioRef?.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  const resetGame = (e) => {
    if (e) e.stopPropagation();

    cancelAnimationFrame(animationRef.current);
    clearTimeout(slowModeTimeoutRef.current);
    clearTimeout(karnaTimeoutRef.current);
    clearTimeout(krishnaTimeoutRef.current);
    clearTimeout(rapidFireTimeoutRef.current);

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

  // Check for power-up triggers
  useEffect(() => {
    if (score >= 800 && score - lastKarnaScore >= 800) {
      setKarnaReady(true);
    }
  }, [score, lastKarnaScore]);

  useEffect(() => {
    if (score >= 8000 && score - lastKrishnaScore >= 8000) {
      setKrishnaReady(true);
    }
  }, [score, lastKrishnaScore]);

  useEffect(() => {
    if (score >= 500 && score - lastRapidFireScore >= 500) {
      setRapidFireReady(true);
    }
  }, [score, lastRapidFireScore]);

  useEffect(() => {
    if (score >= 2000 && score - lastChakraScore >= 2000) {
      setChakraReady(true);
    }
  }, [score, lastChakraScore]);

  useEffect(() => {
    if (score >= 30000 && !isUpgraded) {
      setIsUpgraded(true);
    }
  }, [score, isUpgraded]);

  // Spawn enemies
  useEffect(() => {
    if (gameState !== "playing") return;

    const spawn = setInterval(() => {
      const currentScore = scoreRef.current;

      let hp = 2;
      let isBoss = false;
      let isDushashana = false;
      const rand = Math.random();

      if (currentScore >= 15000 && rand < 0.15) {
        hp = 5;
        isBoss = true;
      } else if (currentScore >= 3000 && rand < 0.3) {
        hp = 3;
        isDushashana = true;
      }

      const newEnemy = {
        id: Date.now() + Math.random(),
        x: Math.random() * 80 + 10,
        y: -10,
        speed: 0.07 + Math.random() * 0.08 + currentScore * 0.00003,
        health: hp,
        maxHealth: hp,
        isBoss,
        isDushashana,
        damageFlash: false,
        side: Math.random() > 0.5 ? "left" : "right",
      };

      if (isBoss) {
        playSound(duryodhanaEntrySound);
      } else if (isDushashana) {
        playSound(dushashanaSound);
      }

      setEnemies((prev) => [...prev, newEnemy]);
    }, 1700);

    return () => clearInterval(spawn);
  }, [gameState]);

  // Main game loop
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

      // Move enemies
      enemiesRef.current.forEach((enemy) => {
        const updated = {
          ...enemy,
          y: enemy.y + enemy.speed * (slowMode ? 0.5 : 1),
        };

        if (updated.y > 95) {
          newLives -= 1;
          newCombo = 0;
        } else {
          newEnemies.push(updated);
        }
      });

      // Move arrows
      newArrows = newArrows
        .map((a) => ({
          ...a,
          x: a.x + a.vx,
          y: a.y + a.vy,
        }))
        .filter((a) => a.y > -10 && a.x >= -10 && a.x <= 110);

      // Move chakras
      newChakras = newChakras
        .map((c) => ({
          ...c,
          x: c.x + c.vx,
          y: c.y + c.vy,
          rotation: (c.rotation || 0) + 8,
        }))
        .filter((c) => c.y > -10 && c.x >= -10 && c.x <= 110);

      // Move health pickups
      newHealthPickups = newHealthPickups
        .map((h) => ({
          ...h,
          y: h.y + 0.5,
        }))
        .filter((h) => h.y < 100);

      // Chakra collision with enemies
      newChakras = newChakras.filter((chakra) => {
        let hit = false;

        newEnemies = newEnemies
          .filter((enemy) => {
            const dx = chakra.x - enemy.x;
            const dy = chakra.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 20 && chakra.side === enemy.side) {
              hit = true;
              playSound(hitSound);

              newCombo += 1;
              const baseKillScore =
                enemy.maxHealth === 5 ? 50 : enemy.maxHealth === 3 ? 25 : 10;
              scoreGain += baseKillScore * (1 + newCombo * 0.2);
              return false;
            }

            return true;
          });

        return !hit;
      });

      // Arrow collision with enemies
      newArrows = newArrows.filter((arrow) => {
        let hit = false;

        newEnemies = newEnemies
          .map((enemy) => {
            const dx = arrow.x - enemy.x;
            const dy = arrow.y - enemy.y;
            const hitRadius = enemy.maxHealth > 2 ? 18 : 12;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < hitRadius && enemy.health > 0 && !hit) {
              hit = true;
              playSound(hitSound);

              const newHealth = enemy.health - 1;

              if (newHealth <= 0) {
                newCombo += 1;
                const baseKillScore =
                  enemy.maxHealth === 5 ? 50 : enemy.maxHealth === 3 ? 25 : 10;
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

      // Health pickup collection
      newHealthPickups = newHealthPickups.filter((pickup) => {
        const dx = pickup.x - 50;
        const dy = pickup.y - 85;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 15) {
          playSound(healthPickupSound);
          if (livesRef.current < 3) {
            livesRef.current += 1;
            newLives = livesRef.current;
          }
          return false;
        }

        return true;
      });

      // If Krishna active, clear enemies and add score
      if (krishnaActiveRef.current && newEnemies.length > 0) {
        newEnemies.forEach((enemy) => {
          newCombo += 1;
          const baseKillScore =
            enemy.maxHealth === 5 ? 50 : enemy.maxHealth === 3 ? 25 : 10;
          scoreGain += baseKillScore * (1 + newCombo * 0.2);
        });
        newEnemies = [];
      }

      // Slow mode trigger
      if (newCombo >= 5 && !slowMode) {
        setSlowMode(true);
        clearTimeout(slowModeTimeoutRef.current);
        slowModeTimeoutRef.current = setTimeout(() => {
          setSlowMode(false);
        }, 2000);
      }

      // Update lives
      if (newLives !== livesRef.current) {
        livesRef.current = newLives;
        setLives(newLives);
      }

      // Update score
      if (scoreGain > 0) {
        setScore((s) => s + scoreGain);
      }

      // Update refs and states
      comboRef.current = newCombo;
      setCombo(newCombo);

      // Damage flash reset
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
    if (score > highScore) {
      setIsNewHighScore(true);
    }
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

  // Power-up functions (Karna, Krishna, Rapid Fire, Chakra)
  const useKarnaPower = () => {
    if (!karnaReady) return;

    setShowKarna(true);
    setKarnaReady(false);
    setLastKarnaScore(scoreRef.current);

    playSound(karnaSound);

    const rays = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      angle: i * 30,
    }));
    setKarnaRays(rays);

    karnaTimeoutRef.current = setTimeout(() => {
      let powerKillScore = 0;
      enemiesRef.current.forEach((e) => {
        powerKillScore += e.maxHealth === 5 ? 50 : e.maxHealth === 3 ? 25 : 10;
      });
      setScore((s) => s + powerKillScore);
      setEnemies([]);
      enemiesRef.current = [];
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

    krishnaTimeoutRef.current = setTimeout(() => {
      setShowKrishna(false);
      setKrishnaActive(false);
    }, 8000);
  };

  const useRapidFirePower = () => {
    if (!rapidFireReady) return;

    setRapidFireActive(true);
    setRapidFireReady(false);
    setLastRapidFireScore(scoreRef.current);

    playSound(rapidSound);

    rapidFireTimeoutRef.current = setTimeout(() => {
      setRapidFireActive(false);
    }, 5000);
  };

  const useChakraPower = (targetDx, targetDy) => {
    if (!chakraReady) return;

    setChakraReady(false);
    setLastChakraScore(scoreRef.current);

    playSound(chakraSound);

    const targetDist = Math.sqrt(targetDx * targetDx + targetDy * targetDy);
    if (!targetDist) return;

    const vx = (targetDx / targetDist) * 1.2;
    const vy = (targetDy / targetDist) * 1.2;
    const side = targetDx > 0 ? "right" : "left";

    setChakras((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        x: 50,
        y: 85,
        vx,
        vy,
        rotation: 0,
        side,
      },
    ]);
  };

  const getArrowType = (vx, vy) => {
    const angle = Math.atan2(vy, vx) * (180 / Math.PI);
    if (angle >= -112.5 && angle < -67.5) return "straight";
    if (angle >= -157.5 && angle < -112.5) return "diag-left";
    if (angle >= -67.5 && angle < -22.5) return "diag-right";
    if (angle >= 157.5 || angle < -157.5) return "left";
    if (angle >= -22.5 && angle < 22.5) return "right";

    return "straight";
  };

  const getArrowAsset = (arrow) => {
    const type = getArrowType(arrow.vx, arrow.vy);

    if (type === "diag-left") return arrowDiagLeftImg;
    if (type === "diag-right") return arrowDiagRightImg;
    if (type === "left") return arrowLeftImg;
    if (type === "right") return arrowRightImg;
    return arrowStraightImg;
  };

  const fireArrow = (targetDx, targetDy) => {
    const targetDist = Math.sqrt(targetDx * targetDx + targetDy * targetDy);
    if (!targetDist) return;

    playSound(shootSound);

    const vx = (targetDx / targetDist) * 1.5;
    const vy = (targetDy / targetDist) * 1.5;

    setArrows((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        x: 50,
        y: 85,
        vx,
        vy,
      },
    ]);
  };

  const shoot = (e) => {
    if (gameState !== "playing") return;
    if (!gameRef.current) return;

    const rect = gameRef.current.getBoundingClientRect();
    const targetX = ((e.clientX - rect.left) / rect.width) * 100;
    const targetY = ((e.clientY - rect.top) / rect.height) * 100;

    const dx = targetX - 50;
    const dy = targetY - 85;

    if (e.button === 2) {
      useChakraPower(dx, dy);
      return;
    }

    if (rapidFireActiveRef.current) {
      const spreadAngle = Math.atan2(dy, dx);

      const fan1 = {
        dx: Math.cos(spreadAngle - 0.2) * 100,
        dy: Math.sin(spreadAngle - 0.2) * 100,
      };

      const fan2 = {
        dx: Math.cos(spreadAngle + 0.2) * 100,
        dy: Math.sin(spreadAngle + 0.2) * 100,
      };

      fireArrow(dx, dy);
      fireArrow(fan1.dx, fan1.dy);
      fireArrow(fan2.dx, fan2.dy);
    } else if (isUpgraded) {
      const spreadAngle = Math.atan2(dy, dx);

      const fan1 = {
        dx: Math.cos(spreadAngle - 0.15) * 100,
        dy: Math.sin(spreadAngle - 0.15) * 100,
      };

      const fan2 = {
        dx: Math.cos(spreadAngle + 0.15) * 100,
        dy: Math.sin(spreadAngle + 0.15) * 100,
      };

      fireArrow(dx, dy);
      fireArrow(fan1.dx, fan1.dy);
      fireArrow(fan2.dx, fan2.dy);
    } else {
      fireArrow(dx, dy);
    }
  };

  // Randomly spawn health pickups when enemies die
  const lastEnemyCountRef = useRef(0);
  useEffect(() => {
    if (enemies.length < lastEnemyCountRef.current && Math.random() < 0.3) {
      const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
      if (randomEnemy) {
        setHealthPickups((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: randomEnemy.x,
            y: randomEnemy.y,
          },
        ]);
      }
    }

    lastEnemyCountRef.current = enemies.length;
  }, [enemies]);

  // Render
  return (
    <div
      ref={gameRef}
      onClick={shoot}
      onContextMenu={(e) => {
        e.preventDefault();
        shoot(e);
      }}
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
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }

        img {
          user-select: none;
          -webkit-user-drag: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          pointer-events: none;
        }

        button {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          border: none;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        button:active:not(:disabled) {
          transform: translateY(-1px);
        }

        @keyframes pulse-glow {
          0%, 100% { text-shadow: 0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3); }
          50% { text-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.5); }
        }

        @keyframes float-pulse {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes slide-in {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes health-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>

      {gameState === "start" && (
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            background: "linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(139, 69, 19, 0.4))",
            backdropFilter: "blur(5px)",
          }}
        >
          <div style={{ marginBottom: "30px" }}>
            <h1
              style={{
                fontSize: "72px",
                margin: "0 0 20px 0",
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "none",
                fontWeight: 900,
                letterSpacing: "3px",
              }}
            >
              🏹 ARJUNA BATTLE
            </h1>
            <p
              style={{
                fontSize: "24px",
                margin: "20px 0",
                color: "#FFD700",
                fontWeight: 600,
                textShadow: "0 2px 10px rgba(0, 0, 0, 0.8)",
              }}
            >
              Defend your land from the demon hordes
            </p>
          </div>

          <div
            style={{
              background: "rgba(0, 0, 0, 0.5)",
              border: "3px solid #FFD700",
              borderRadius: "15px",
              padding: "25px 40px",
              marginBottom: "30px",
              boxShadow: "0 8px 32px rgba(255, 215, 0, 0.2)",
            }}
          >
            <p style={{ fontSize: "20px", margin: "10px 0", color: "#FFF" }}>
              High Score: <span style={{ fontSize: "28px", color: "#FFD700", fontWeight: "bold" }}>{highScore}</span>
            </p>
            <div style={{ fontSize: "14px", color: "#CCC", marginTop: "15px", lineHeight: "1.8" }}>
              <p>⚡ Call Karna at 800 points</p>
              <p>🦚 Call Krishna at 8000 points</p>
              <p>🏹 Rapid Fire at 500 points</p>
              <p>💫 Chakra Power at 2000 points (Right Click)</p>
              <p>💚 Health Pickups appear randomly</p>
              <p>✨ Upgraded Arjuna at 30000 points</p>
            </div>
          </div>

          <button
            onClick={resetGame}
            style={{
              padding: "16px 50px",
              fontSize: "24px",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #FFD700, #FFA500)",
              color: "black",
              borderRadius: "12px",
              cursor: "pointer",
              letterSpacing: "1px",
            }}
          >
            ⚔️ START GAME
          </button>
        </div>
      )}

      {gameState === "playing" && (
        <>
          {/* Score Card */}
          <div
            style={{
              position: "absolute",
              top: "15px",
              left: "15px",
              background: "linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(139, 69, 19, 0.6))",
              border: "2px solid #FFD700",
              borderRadius: "15px",
              padding: "20px 30px",
              zIndex: 20,
              backdropFilter: "blur(10px)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
              minWidth: "380px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "14px", color: "#AAA", display: "block", marginBottom: "4px" }}>SCORE</span>
                <span style={{ fontSize: "32px", fontWeight: "bold", color: "#FFD700" }}>
                  {Math.floor(score).toLocaleString()}
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "14px", color: "#AAA", display: "block", marginBottom: "4px" }}>HIGH SCORE</span>
                <span style={{ fontSize: "28px", fontWeight: "bold", color: "#FFB347" }}>
                  {highScore.toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
              <div>
                <span style={{ fontSize: "14px", color: "#AAA", display: "block", marginBottom: "4px" }}>COMBO</span>
                <span style={{ fontSize: "24px", fontWeight: "bold", color: combo > 0 ? "#00FF00" : "#999" }}>
                  x{combo}
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "14px", color: "#AAA", display: "block", marginBottom: "4px" }}>LIVES</span>
                <span style={{ fontSize: "28px", fontWeight: "bold", color: "#FF6B6B" }}>
                  {"❤️".repeat(Math.max(0, lives))}
                </span>
              </div>
            </div>
          </div>

          {/* New High Score Alert */}
          {isNewHighScore && score > 0 && (
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 21,
                fontSize: "28px",
                fontWeight: "bold",
                color: "#FFD700",
                textShadow: "0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 165, 0, 0.6)",
                animation: "pulse-glow 1s infinite",
              }}
            >
              🔥 NEW HIGH SCORE! 🔥
            </div>
          )}

          {/* Power Ups Panel */}
          <div
            style={{
              position: "absolute",
              right: "20px",
              top: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              zIndex: 20,
            }}
          >
            {/* Upgraded Status */}
            {isUpgraded && (
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(100, 200, 255, 0.3), rgba(0, 150, 255, 0.3))",
                  border: "2px solid #00BFFF",
                  borderRadius: "10px",
                  padding: "10px 15px",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "13px",
                  color: "#00BFFF",
                  boxShadow: "0 0 15px rgba(0, 191, 255, 0.3)",
                  animation: "float-pulse 2s ease-in-out infinite",
                }}
              >
                ✨ UPGRADED MODE
              </div>
            )}

            {karnaReady && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  useKarnaPower();
                }}
                style={{
                  padding: "12px 18px",
                  background: "linear-gradient(135deg, #FFD700, #FFA500)",
                  color: "black",
                  fontWeight: "bold",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "13px",
                  animation: "slide-in 0.3s ease-out",
                }}
              >
                ⚡ CALL KARNA
              </button>
            )}

            {krishnaReady && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  useKrishnaPower();
                }}
                style={{
                  padding: "12px 18px",
                  background: "linear-gradient(135deg, #00BFFF, #0090FF)",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "13px",
                  animation: "slide-in 0.3s ease-out",
                }}
              >
                🦚 CALL KRISHNA
              </button>
            )}

            {rapidFireReady && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  useRapidFirePower();
                }}
                style={{
                  padding: "12px 18px",
                  background: "linear-gradient(135deg, #00FF00, #32CD32)",
                  color: "black",
                  fontWeight: "bold",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "13px",
                  animation: "slide-in 0.3s ease-out",
                }}
              >
                🏹 RAPID FIRE
              </button>
            )}

            {chakraReady && (
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(200, 100, 255, 0.3), rgba(150, 50, 255, 0.3))",
                  border: "2px solid #DA70D6",
                  borderRadius: "10px",
                  padding: "10px 15px",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "12px",
                  color: "#DA70D6",
                  boxShadow: "0 0 15px rgba(218, 112, 214, 0.3)",
                }}
              >
                💫 CHAKRA READY (Right Click)
              </div>
            )}
          </div>

          {/* Karna Power Visualization */}
          {showKarna &&
            karnaRays.map((ray) => (
              <div
                key={ray.id}
                style={{
                  position: "absolute",
                  bottom: "10%",
                  left: "50%",
                  width: "6px",
                  height: "250px",
                  background: "linear-gradient(to top, #FFD700, rgba(255, 215, 0, 0))",
                  transform: `translateX(-50%) rotate(${ray.angle}deg)`,
                  transformOrigin: "bottom",
                  opacity: 0.8,
                  zIndex: 9,
                  boxShadow: "0 0 20px rgba(255, 215, 0, 0.8)",
                }}
              />
            ))}

          {showKarna && (
            <img
              src={karnaImg}
              alt="Karna"
              style={{
                position: "absolute",
                bottom: "10%",
                left: "50%",
                transform: "translateX(-50%) scale(1.2)",
                width: "200px",
                zIndex: 10,
                filter: "drop-shadow(0px 0px 25px rgba(255, 215, 0, 0.8))",
                userSelect: "none",
              }}
              draggable="false"
            />
          )}

          {showKrishna && (
            <img
              src={krishnaImg}
              alt="Krishna"
              style={{
                position: "absolute",
                top: "15%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "250px",
                zIndex: 5,
                opacity: 0.9,
                filter: "drop-shadow(0 0 30px rgba(0, 191, 255, 0.8))",
                userSelect: "none",
              }}
              draggable="false"
            />
          )}

          {/* Chakras */}
          {chakras.map((c) => (
            <div
              key={c.id}
              style={{
                position: "absolute",
                top: `${c.y}%`,
                left: `${c.x}%`,
                width: "40px",
                height: "40px",
                background: "radial-gradient(circle, #DA70D6, #9932CC)",
                borderRadius: "50%",
                transform: `translate(-50%, -50%) rotate(${c.rotation}deg)`,
                zIndex: 3,
                boxShadow: "0 0 20px rgba(218, 112, 214, 0.8)",
                border: "2px solid #FF00FF",
              }}
            />
          ))}

          {/* Health Pickups */}
          {healthPickups.map((h) => (
            <div
              key={h.id}
              style={{
                position: "absolute",
                top: `${h.y}%`,
                left: `${h.x}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 4,
                animation: "health-bounce 0.6s ease-in-out infinite",
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  textShadow: "0 0 10px rgba(0, 255, 0, 0.8)",
                  filter: "drop-shadow(0 0 8px rgba(0, 255, 0, 0.6))",
                }}
              >
                💚
              </div>
            </div>
          ))}

          {/* Arjuna */}
          <img
            src={isUpgraded ? upgradedArjunaImg : arjunaImg}
            alt="Arjuna"
            style={{
              position: "absolute",
              bottom: "2%",
              left: "50%",
              transform: "translateX(-50%)",
              width: isUpgraded ? "240px" : "220px",
              zIndex: 10,
              filter: rapidFireActive ? "drop-shadow(0px 0px 20px rgba(0, 255, 0, 0.8))" : "none",
              transition: "all 0.3s ease",
              userSelect: "none",
            }}
            draggable="false"
          />

          {/* Enemies */}
          {enemies.map((e) => {
            let imgWidth = "70px";
            let demonImg = enemyImg;

            if (e.maxHealth === 3) {
              imgWidth = "85px";
              demonImg = dushashanaImg;
            }

            if (e.maxHealth === 5) {
              imgWidth = "110px";
              demonImg = duryodhanaImg;
            }

            return (
              <div
                key={e.id}
                style={{
                  position: "absolute",
                  top: `${e.y}%`,
                  left: `${e.x}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 1,
                }}
              >
                <img
                  src={demonImg}
                  alt="Enemy"
                  style={{
                    width: imgWidth,
                    display: "block",
                    filter: e.damageFlash
                      ? "brightness(2) drop-shadow(0 0 10px rgba(255, 255, 0, 0.8))"
                      : e.maxHealth > 2
                      ? "drop-shadow(0px 0px 15px rgba(255, 0, 0, 0.8))"
                      : "drop-shadow(0px 0px 8px rgba(200, 0, 0, 0.6))",
                    transition: "filter 0.1s",
                    userSelect: "none",
                  }}
                  draggable="false"
                />
                <div
                  style={{
                    width: imgWidth,
                    height: "8px",
                    background: "rgba(0, 0, 0, 0.7)",
                    marginTop: "6px",
                    borderRadius: "4px",
                    overflow: "hidden",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 0 8px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <div
                    style={{
                      width: `${(e.health / e.maxHealth) * 100}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #FF4444, #FF0000)",
                      transition: "width 0.2s",
                      boxShadow: "0 0 8px rgba(255, 0, 0, 0.6)",
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* Arrows with rotation */}
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
        userSelect: "none",
        WebkitUserDrag: "none",
        transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
        transformOrigin: "50% 50%",
      }}
    />
  );
})}
        </>
      )}

      {gameState === "gameover" && (
        <div
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
            background: "linear-gradient(135deg, rgba(0, 0, 0, 0.85), rgba(139, 69, 19, 0.5))",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 30,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontSize: "64px",
                margin: "0 0 30px 0",
                background: "linear-gradient(135deg, #FF6B6B, #FF0000)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "none",
                fontWeight: 900,
                letterSpacing: "2px",
              }}
            >
              💀 GAME OVER
            </h1>

            <div
              style={{
                background: "rgba(0, 0, 0, 0.6)",
                border: "3px solid #FFD700",
                borderRadius: "15px",
                padding: "40px",
                marginBottom: "30px",
                boxShadow: "0 12px 48px rgba(0, 0, 0, 0.6)",
              }}
            >
              <div style={{ marginBottom: "25px" }}>
                <p style={{ fontSize: "18px", color: "#AAA", margin: "0 0 8px 0" }}>FINAL SCORE</p>
                <h2
                  style={{
                    fontSize: "48px",
                    color: "#FFD700",
                    margin: 0,
                    fontWeight: "bold",
                  }}
                >
                  {Math.floor(score).toLocaleString()}
                </h2>
              </div>

              <div style={{ marginBottom: "25px" }}>
                <p style={{ fontSize: "18px", color: "#AAA", margin: "0 0 8px 0" }}>BEST SCORE</p>
                <h2
                  style={{
                    fontSize: "42px",
                    color: "#FFB347",
                    margin: 0,
                    fontWeight: "bold",
                  }}
                >
                  {highScore.toLocaleString()}
                </h2>
              </div>

              {isNewHighScore && (
                <div
                  style={{
                    fontSize: "28px",
                    color: "#FFD700",
                    fontWeight: "bold",
                    marginTop: "25px",
                    animation: "pulse-glow 1s infinite",
                  }}
                >
                  🏆 NEW HIGH SCORE! 🏆
                </div>
              )}
            </div>

            <button
              onClick={resetGame}
              style={{
                padding: "16px 50px",
                fontSize: "22px",
                fontWeight: "bold",
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                color: "black",
                borderRadius: "12px",
                cursor: "pointer",
                letterSpacing: "1px",
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