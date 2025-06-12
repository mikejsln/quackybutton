"use client";
import React, { useState, useRef, useEffect } from "react";

const LEVELS = [
  "Beginner", "Rookie", "Clicker", "Pro", "Expert", "Master", "Legend", "Epic", "Awesome", "Unreal",
  "Duckling", "Quacker", "Feathered", "Waddler", "Splash", "Pond King", "Mallard", "Golden Egg", "Quackstar", "Infinity"
];

const DUCK_WALLPAPER = "/duck-wallpaper.jpg"; // Replace with actual image later

// Add silly duck faces
const DUCK_FACES = [
  "🦆", "🐤", "🐥", "🪿", "😆", "😜", "🤪", "😝", "😂", "🥚", "👑", "🎩", "😎", "👀", "💩", "👻", "🥸", "😏", "😲", "😳", "😱"
];

// Add more silly sound effects
const SILLY_SOUNDS = [
  '/quack.mp3',
  '/kazoo.mp3',
  '/honk.mp3',
  '/slidewhistle.mp3',
];

// Add silly hats and glasses for ducks
const HATS = ["🎩", "🧢", "👑", "⛑️", "👒", "🪖", "🕶️", "😎", "🥽", "👓", "🦄"];

// Silly banner messages
const BANNERS = [
  "Quack-tastic!", "Duck yeah!", "Waddle on!", "Feather frenzy!", "Egg-cellent!", "Silly goose!", "Quack attack!", "Duck to the future!", "Pond party!", "Quack-a-doodle-doo!", "Duck Norris!", "Sir Quacksalot!", "Ducktopus!", "Quackzilla!", "Duck Vader!", "Eggstraordinary!", "Duck Duck Boom!", "Quack-a-palooza!", "Waddle you do?", "Duck-ception!"
];

export default function ClickerGame() {
  const [clicks, setClicks] = useState(0);
  const [timer, setTimer] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [level, setLevel] = useState(LEVELS[0]);
  const [clickTimestamps, setClickTimestamps] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const quackBufferRef = useRef<AudioBuffer | null>(null);
  const loadingSoundRef = useRef(false);
  const [duckFace, setDuckFace] = useState(DUCK_FACES[0]);
  const [wobble, setWobble] = useState(false);
  const [floatingDucks, setFloatingDucks] = useState<{id:number, left:number, top:number, size:number, speed:number}[]>([]);
  const [buttonTransform, setButtonTransform] = useState({scale:1,rotate:0,spin:false});
  const sillyBuffersRef = useRef<{[key:string]:AudioBuffer}>({});
  const [banner, setBanner] = useState(BANNERS[0]);
  const [confetti, setConfetti] = useState<{id:number, left:number, top:number, color:string, size:number, angle:number, speed:number}[]>([]);

  useEffect(() => {
    if (gameActive && timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (timer === 0) {
      setGameActive(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameActive, timer]);

  useEffect(() => {
    if (clicks >= 300) {
      setLevel("Infinity");
    } else {
      setLevel(LEVELS[Math.floor(clicks / 10)] || LEVELS[LEVELS.length - 2]);
    }
  }, [clicks]);

  useEffect(() => {
    if (audioCtxRef.current == null && typeof window !== 'undefined') {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (!quackBufferRef.current && !loadingSoundRef.current && audioCtxRef.current) {
      loadingSoundRef.current = true;
      fetch('/quack.mp3')
        .then(res => res.arrayBuffer())
        .then(arrayBuffer => audioCtxRef.current!.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          quackBufferRef.current = audioBuffer;
        });
    }
  }, []);

  // Animate floating ducks
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingDucks((ducks) =>
        ducks
          .map(d => ({ ...d, top: d.top + d.speed }))
          .filter(d => d.top < 100)
      );
      // Add new duck occasionally
      if (Math.random() < 0.2) {
        setFloatingDucks(ducks => [
          ...ducks,
          {
            id: Math.random(),
            left: Math.random() * 90,
            top: -10,
            size: 32 + Math.random() * 32,
            speed: 0.5 + Math.random() * 1.5
          }
        ]);
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  // Load silly sounds
  useEffect(() => {
    if (audioCtxRef.current == null && typeof window !== 'undefined') {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    SILLY_SOUNDS.forEach(sound => {
      if (!sillyBuffersRef.current[sound] && audioCtxRef.current) {
        fetch(sound)
          .then(res => res.arrayBuffer())
          .then(arrayBuffer => audioCtxRef.current!.decodeAudioData(arrayBuffer))
          .then(audioBuffer => {
            sillyBuffersRef.current[sound] = audioBuffer;
          });
      }
    });
  }, []);

  function playSillySound(withEcho: boolean) {
    if (!audioCtxRef.current) return;
    // 80% quack, 20% random silly
    let sound = Math.random() < 0.8 ? '/quack.mp3' : SILLY_SOUNDS[Math.floor(Math.random() * SILLY_SOUNDS.length)];
    const buffer = sillyBuffersRef.current[sound] || quackBufferRef.current;
    if (!buffer) return;
    const ctx = audioCtxRef.current;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    let node: AudioNode = source;
    if (withEcho) {
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.18;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.45;
      delay.connect(feedback);
      feedback.connect(delay);
      node.connect(delay);
      delay.connect(ctx.destination);
      node = delay;
    }
    node.connect(ctx.destination);
    source.start(0);
  }

  const handleClick = () => {
    if (!gameActive) {
      setGameActive(true);
      setTimer(60);
      setClicks(1);
      setClickTimestamps([Date.now()]);
      setLevel(LEVELS[0]);
      setDuckFace(DUCK_FACES[Math.floor(Math.random() * DUCK_FACES.length)]);
      setWobble(true);
      setBanner(BANNERS[0]);
      playSillySound(false);
      return;
    }
    if (timer > 0) {
      setClicks((c) => c + 1);
      setClickTimestamps((prev) => {
        const next = [...prev, Date.now()];
        return next.length > 10 ? next.slice(-10) : next;
      });
      setDuckFace(DUCK_FACES[Math.floor(Math.random() * DUCK_FACES.length)]);
      setWobble(true);
      // Button random transform
      setButtonTransform({
        scale: 0.9 + Math.random() * 0.4,
        rotate: -15 + Math.random() * 30,
        spin: Math.random() < 0.2
      });
      // Confetti burst every 50 clicks
      if ((clicks + 1) % 50 === 0) {
        for (let i = 0; i < 24; i++) {
          setConfetti(confetti => [
            ...confetti,
            {
              id: Math.random(),
              left: 45 + Math.random() * 10,
              top: 45 + Math.random() * 10,
              color: `hsl(${Math.random()*360},90%,60%)`,
              size: 8 + Math.random() * 12,
              angle: Math.random() * 360,
              speed: 1 + Math.random() * 2
            }
          ]);
        }
      }
      // Banner message every 10 clicks
      if ((clicks + 1) % 10 === 0) {
        setBanner(BANNERS[Math.floor(Math.random() * BANNERS.length)]);
      }
      playSillySound(clicks + 1 >= 300);
    }
  };

  // Remove wobble after animation
  useEffect(() => {
    if (wobble) {
      const t = setTimeout(() => setWobble(false), 400);
      return () => clearTimeout(t);
    }
  }, [wobble]);

  // Calculate average clicks per minute (last 10 clicks)
  let avgCPM = 0;
  if (clickTimestamps.length > 1) {
    const intervals = clickTimestamps.slice(1).map((t, i) => t - clickTimestamps[i]);
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    avgCPM = avgInterval > 0 ? Math.round(60000 / avgInterval) : 0;
  }

  // Animate confetti
  useEffect(() => {
    if (confetti.length === 0) return;
    const interval = setInterval(() => {
      setConfetti(confetti => confetti.map(c => ({...c, top: c.top + c.speed})).filter(c => c.top < 120));
    }, 30);
    return () => clearInterval(interval);
  }, [confetti]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(/duck-pattern.png)`,
        backgroundSize: "auto 200px",
        backgroundRepeat: "repeat",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: 'Comic Sans MS, Comic Sans, cursive',
      }}
    >
      {/* Confetti */}
      <div style={{position:'fixed',left:0,top:0,width:'100vw',height:'100vh',pointerEvents:'none',zIndex:10}}>
        {confetti.map(c => (
          <div key={c.id} style={{
            position:'absolute',
            left:`${c.left}%`,
            top:`${c.top}%`,
            width:c.size,
            height:c.size,
            background:c.color,
            borderRadius:'50%',
            transform:`rotate(${c.angle}deg)`,
            boxShadow:'0 2px 6px #0002',
            opacity:0.85
          }} />
        ))}
      </div>
      {/* Floating ducks with hats/glasses */}
      <div style={{position:'fixed',left:0,top:0,width:'100vw',height:'100vh',pointerEvents:'none',zIndex:0}}>
        {floatingDucks.map(d => {
          const hasHat = Math.random() < 0.25;
          const hat = hasHat ? HATS[Math.floor(Math.random()*HATS.length)] : '';
          return (
            <span key={d.id} style={{
              position:'absolute',
              left:`${d.left}%`,
              top:`${d.top}%`,
              fontSize:d.size,
              transition:'top 0.06s',
              filter:'drop-shadow(0 2px 4px #0002)'
            }}>{hat}🦆</span>
          );
        })}
      </div>
      {/* Silly banner */}
      <div style={{
        fontSize:28,
        color:'#fff',
        background:'#ff9800',
        borderRadius:16,
        padding:'8px 32px',
        marginBottom:18,
        fontWeight:'bold',
        boxShadow:'0 2px 8px #1976d2',
        border:'4px solid #fff',
        zIndex:2,
        textShadow:'2px 2px 0 #1976d2',
        transform:'rotate(-3deg)'
      }}>{banner}</div>
      <div style={{
        background: "rgba(255,255,255,0.85)",
        borderRadius: 24,
        padding: 28,
        maxWidth: 420,
        width: "100%",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: '4px dashed #ffeb3b',
        zIndex:1
      }}>
        <h1 style={{ marginBottom: 8, fontFamily: 'Comic Sans MS, Comic Sans, cursive', color:'#ff9800', fontSize:36, textShadow:'2px 2px 0 #fff, 4px 4px 0 #ffeb3b'}}>Duck Clicker</h1>
        <div style={{ fontSize: 22, marginBottom: 8, color:'#1976d2', fontWeight:'bold', textShadow:'1px 1px 0 #fff'}}>Time Left: <b>{timer}s</b></div>
        <div style={{ fontSize: 22, marginBottom: 8, color:'#43a047', fontWeight:'bold', textShadow:'1px 1px 0 #fff'}}>Level: <b>{level}</b></div>
        <div style={{ fontSize: 22, marginBottom: 8, color:'#b71c1c', fontWeight:'bold', textShadow:'1px 1px 0 #fff'}}>Clicks: <b>{clicks}</b></div>
        <button
          onClick={handleClick}
          disabled={timer === 0}
          style={{
            width: 180,
            height: 180,
            borderRadius: "50%",
            fontSize: 60,
            fontWeight: "bold",
            background: clicks >= 300 ? "#eee" : "#ffeb3b",
            color: "#333",
            border: clicks >= 300 ? "6px solid #b71c1c" : "6px solid #1976d2",
            boxShadow: clicks >= 300 ? "0 0 32px 8px #b71c1c" : "0 8px 32px #1976d2",
            margin: 16,
            position: "relative",
            transition: "all 0.2s",
            cursor: timer === 0 ? "not-allowed" : "pointer",
            transform: `scale(${buttonTransform.scale}) rotate(${buttonTransform.rotate}deg) ${buttonTransform.spin ? 'rotate(360deg)' : ''}`,
            animation: wobble ? 'wobble 0.4s' : 'none',
            outline: 'none',
            userSelect: 'none',
          }}
        >
          {clicks >= 300 ? (
            <span style={{ color: "#b71c1c", fontSize: 60 }}>💥</span>
          ) : (
            duckFace
          )}
        </button>
        <style>{`
          @keyframes wobble {
            0% { transform: scale(1) rotate(0deg); }
            20% { transform: scale(1.1) rotate(-8deg); }
            50% { transform: scale(0.95) rotate(8deg); }
            80% { transform: scale(1.05) rotate(-4deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
        `}</style>
        <div style={{ width: "100%", marginTop: 16 }}>
          <div style={{ fontSize: 18, marginBottom: 4, color:'#1976d2', fontWeight:'bold', textShadow:'1px 1px 0 #fff'}}>Avg Clicks/Min (last 10): <b>{avgCPM}</b></div>
          <div style={{
            height: 20,
            width: "100%",
            background: "#e0e0e0",
            borderRadius: 12,
            overflow: "hidden",
            border: '2px solid #ffeb3b',
          }}>
            <div style={{
              height: "100%",
              width: `${Math.min(avgCPM, 300) / 3}%`,
              background: avgCPM > 200 ? "#43a047" : avgCPM > 100 ? "#fbc02d" : "#e53935",
              transition: "width 0.3s"
            }} />
          </div>
        </div>
        {timer === 0 && (
          <div style={{ marginTop: 24, fontSize: 24, color: "#1976d2", fontWeight:'bold', textShadow:'1px 1px 0 #fff'}}>
            Game Over! Final Clicks: <b>{clicks}</b>
            <br />
            <button style={{ marginTop: 12, padding: "12px 32px", fontSize: 20, borderRadius: 12, background:'#ffeb3b', color:'#333', fontWeight:'bold', border:'2px solid #1976d2', boxShadow:'0 2px 8px #1976d2'}} onClick={() => {
              setClicks(0);
              setTimer(60);
              setGameActive(false);
              setLevel(LEVELS[0]);
              setClickTimestamps([]);
              setBanner(BANNERS[0]);
            }}>Restart</button>
          </div>
        )}
      </div>
    </div>
  );
} 