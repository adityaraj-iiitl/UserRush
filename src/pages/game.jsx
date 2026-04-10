import { useEffect, useState, useRef } from "react";

import arjunaImg from "./arjuna.png";
import enemyImg from "./enemy.png";
import dushashanaImg from "./dushashana.png";
import duryodhanaImg from "./duryodhana.png";
import arrowLeftImg from "./arrow-right.png";
import arrowStraightImg from "./arrow-straight.png";
import arrowRightImg from "./arrow-left.png";
import karnaImg from "./karna.png";
import krishnaImg from "./krishna.png";
import bgImg from "./background.png";

import shootSoundFile from "./shoot.mp3";
import hitSoundFile from "./hit.mp3";
import karnaSoundFile from "./karna.mp3";
import krishnaSoundFile from "./krishna.mp3";
import rapidSoundFile from "./rapid.mp3";
import dushashanaSoundFile from "./dus.mp3";
import duryodhanaEntrySoundFile from "./rapidFire.mp3";
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

  const gameRef = useRef(null);
  const animationRef = useRef(null);
  const slowModeTimeoutRef = useRef(null);
  const karnaTimeoutRef = useRef(null);
  const krishnaTimeoutRef = useRef(null);
  const rapidFireTimeoutRef = useRef(null);

  const enemiesRef = useRef([]);
  const arrowsRef = useRef([]);
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
  const bgMusic = useRef(null);

  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);

  useEffect(() => {
    arrowsRef.current = arrows;
  }, [arrows]);

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

  useEffect(() => {
    shootSound.current = new Audio(shootSoundFile);
    hitSound.current = new Audio(hitSoundFile);
    karnaSound.current = new Audio(karnaSoundFile);
    krishnaSound.current = new Audio(krishnaSoundFile);
    rapidSound.current = new Audio(rapidSoundFile);
    dushashanaSound.current = new Audio(dushashanaSoundFile);
    duryodhanaEntrySound.current = new Audio(duryodhanaEntrySoundFile);
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

    livesRef.current = 3;
    enemiesRef.current = [];
    arrowsRef.current = [];
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

  useEffect(() => {
    if (score - lastKarnaScore >= 800) {
      setKarnaReady(true);
    }
  }, [score, lastKarnaScore]);

  useEffect(() => {
    if (score - lastKrishnaScore >= 3000) {
      setKrishnaReady(true);
    }
  }, [score, lastKrishnaScore]);

  useEffect(() => {
    if (score - lastRapidFireScore >= 500) {
      setRapidFireReady(true);
    }
  }, [score, lastRapidFireScore]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const spawn = setInterval(() => {
      const currentScore = scoreRef.current;

      let hp = 2;
      let isBoss = false;
      let isDushashana = false;
      const rand = Math.random();

      if (currentScore >= 7000 && rand < 0.15) {
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

  useEffect(() => {
    if (gameState !== "playing") return;

    const loop = () => {
      let newEnemies = [];
      let newArrows = [...arrowsRef.current];
      let newLives = livesRef.current;
      let scoreGain = 0;
      let newCombo = comboRef.current;

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

      newArrows = newArrows
        .map((a) => ({
          ...a,
          x: a.x + a.vx,
          y: a.y + a.vy,
        }))
        .filter((a) => a.y > -10 && a.x >= -10 && a.x <= 110);

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

      if (krishnaActiveRef.current && newEnemies.length > 0) {
        newEnemies.forEach((enemy) => {
          newCombo += 1;
          const baseKillScore =
            enemy.maxHealth === 5 ? 50 : enemy.maxHealth === 3 ? 25 : 10;
          scoreGain += baseKillScore * (1 + newCombo * 0.2);
        });
        newEnemies = [];
      }

      if (newCombo >= 5 && !slowMode) {
        setSlowMode(true);
        clearTimeout(slowModeTimeoutRef.current);
        slowModeTimeoutRef.current = setTimeout(() => {
          setSlowMode(false);
        }, 2000);
      }

      if (newLives !== livesRef.current) {
        livesRef.current = newLives;
        setLives(newLives);
      }

      if (scoreGain > 0) {
        setScore((s) => s + scoreGain);
      }

      comboRef.current = newCombo;
      setCombo(newCombo);

      newEnemies = newEnemies.map((e) =>
        e.damageFlash ? { ...e, damageFlash: false } : e
      );

      setEnemies(newEnemies);
      setArrows(newArrows);

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, slowMode]);

  useEffect(() => {
    if (score > highScore) {
      setIsNewHighScore(true);
    }
  }, [score, highScore]);

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

  const getArrowType = (vx) => {
    if (vx < -0.5) return "left";
    if (vx > 0.5) return "right";
    return "straight";
  };

  const getArrowAsset = (arrow) => {
    const type = getArrowType(arrow.vx);

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
    } else {
      fireArrow(dx, dy);
    }
  };

  return (
    <div
      ref={gameRef}
      onClick={shoot}
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
      }}
    >
      {gameState === "start" && (
        <div style={{ textAlign: "center", marginTop: "40vh" }}>
          <h1>🏹 Arjuna Battle</h1>
          <p>Defend your land from the demon hordes.</p>
          <p>High Score: {highScore}</p>
          <button onClick={resetGame}>Start Game</button>
        </div>
      )}

      {gameState === "playing" && (
        <>
          <div
            style={{
              position: "absolute",
              top: 10,
              width: "100%",
              textAlign: "center",
              zIndex: 20,
              fontSize: "22px",
              fontWeight: "bold",
              textShadow: "0 0 10px black",
            }}
          >
            Score: {Math.floor(score)} | High Score: {highScore} | Combo: {combo} | Lives: {"❤️".repeat(lives)}
          </div>

          {isNewHighScore && score > 0 && (
            <div
              style={{
                position: "absolute",
                top: "50px",
                width: "100%",
                textAlign: "center",
                zIndex: 21,
                fontSize: "24px",
                fontWeight: "bold",
                color: "gold",
                textShadow: "0 0 10px black",
              }}
            >
              🔥 NEW HIGH SCORE!
            </div>
          )}

          <div
            style={{
              position: "absolute",
              right: "20px",
              top: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              zIndex: 20,
            }}
          >
            {karnaReady && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  useKarnaPower();
                }}
                style={{
                  padding: "10px 16px",
                  background: "gold",
                  color: "black",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                ⚡ Call Karna
              </button>
            )}

            {krishnaReady && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  useKrishnaPower();
                }}
                style={{
                  padding: "10px 16px",
                  background: "#00bfff",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                🦚 Call Krishna
              </button>
            )}

            {rapidFireReady && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  useRapidFirePower();
                }}
                style={{
                  padding: "10px 16px",
                  background: "lime",
                  color: "black",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                🏹 Rapid Fire
              </button>
            )}
          </div>

          {showKarna &&
            karnaRays.map((ray) => (
              <div
                key={ray.id}
                style={{
                  position: "absolute",
                  bottom: "10%",
                  left: "50%",
                  width: "4px",
                  height: "200px",
                  background: "gold",
                  transform: `translateX(-50%) rotate(${ray.angle}deg)`,
                  transformOrigin: "bottom",
                  opacity: 0.6,
                  zIndex: 9,
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
                filter: "drop-shadow(0px 0px 15px gold)",
              }}
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
                opacity: 0.85,
                filter: "drop-shadow(0 0 20px cyan)",
              }}
            />
          )}

          <img
            src={arjunaImg}
            alt="Arjuna"
            style={{
              position: "absolute",
              bottom: "2%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "220px",
              zIndex: 10,
              filter: rapidFireActive ? "drop-shadow(0px 0px 15px lime)" : "none",
              transition: "bottom 0.2s",
            }}
          />

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
                      ? "brightness(2)"
                      : e.maxHealth > 2
                      ? "drop-shadow(0px 0px 10px red)"
                      : "none",
                    transition: "filter 0.1s",
                  }}
                />
                <div
                  style={{
                    width: imgWidth,
                    height: "6px",
                    background: "#333",
                    marginTop: "4px",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(e.health / e.maxHealth) * 100}%`,
                      height: "100%",
                      background: "red",
                      transition: "width 0.2s",
                    }}
                  />
                </div>
              </div>
            );
          })}

          {arrows.map((a) => (
            <img
              key={a.id}
              src={getArrowAsset(a)}
              alt="Arrow"
              style={{
                position: "absolute",
                top: `${a.y}%`,
                left: `${a.x}%`,
                width: "45px",
                zIndex: 2,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            />
          ))}
        </>
      )}

      {gameState === "gameover" && (
        <div
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 30,
          }}
        >
          <h1>Game Over</h1>
          <h2>Final Score: {Math.floor(score)}</h2>
          <h2>Highest Score: {highScore}</h2>
          {isNewHighScore && <h2 style={{ color: "gold" }}>🔥 NEW HIGH SCORE!</h2>}
          <button
            onClick={resetGame}
            style={{
              padding: "10px 20px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            Replay
          </button>
        </div>
      )}
    </div>
  );
} 