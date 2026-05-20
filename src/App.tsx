import { useState, useEffect, useRef, useCallback } from "react";
import './App.css';

type Task = {
  id: number;
  title: string;
  status: "todo" | "doing" | "done";
  deadline: string; // Format: YYYY-MM-DD
};

type ColumnType = "todo" | "doing" | "done";

const columnConfig: Record<ColumnType, { title: string; icon: string; accent: string }> = {
  todo:  { title: "To Do",       icon: "ti-clipboard-list", accent: "col-blue"  },
  doing: { title: "In Progress", icon: "ti-flame",          accent: "col-amber" },
  done:  { title: "Done",        icon: "ti-circle-check",   accent: "col-green" },
};

// ── Confetti ──────────────────────────────────────────────
function launchConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = ["#378ADD","#1D9E75","#D85A30","#7F77DD","#D4537E","#EF9F27","#5DCAA5"];
  const pieces = Array.from({ length: 140 }, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 120,
    vx: (Math.random() - 0.5) * 5,
    vy: 2 + Math.random() * 4,
    r: 4 + Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * 360,
    rv: (Math.random() - 0.5) * 9,
    life: 1,
    wide: Math.random() > 0.5,
  }));
  let frame: number;
  function draw() {
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.09;
      p.rot += p.rv; p.life -= 0.011;
      if (p.life > 0 && p.y < canvas.height + 20) {
        alive = true;
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate((p.rot * Math.PI) / 180);
        ctx!.globalAlpha = Math.max(0, p.life);
        ctx!.fillStyle = p.color;
        if (p.wide) ctx!.fillRect(-p.r, -p.r / 3, p.r * 2, p.r * 0.7);
        else { ctx!.beginPath(); ctx!.arc(0, 0, p.r / 2, 0, Math.PI * 2); ctx!.fill(); }
        ctx!.restore();
      }
    });
    if (alive) frame = requestAnimationFrame(draw);
    else ctx!.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
  return () => cancelAnimationFrame(frame);
}

// ── Particle Field ────────────────────────────────────────
function initParticleField(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  if (!ctx) return () => {};

  let W = window.innerWidth;
  let H = window.innerHeight;
  canvas.width = W; canvas.height = H;

  const COUNT = 90;
  const CONNECT_DIST = 130;
  const REPEL_DIST   = 110;
  const REPEL_FORCE  = 0.38;
  const SPEED        = 0.45;

  const mouse = { x: -999, y: -999 };

  type Particle = {
    x: number; y: number;
    vx: number; vy: number;
    r: number; baseR: number;
    hue: number;
  };

  const particles: Particle[] = Array.from({ length: COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * SPEED,
    vy: (Math.random() - 0.5) * SPEED,
    r: 1.5 + Math.random() * 1.5,
    baseR: 1.5 + Math.random() * 1.5,
    hue: 190 + Math.random() * 50,
  }));

  const onMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
  const onTouchMove = (e: TouchEvent) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  };
  const onResize = () => {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W; canvas.height = H;
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("touchmove", onTouchMove, { passive: true });
  window.addEventListener("resize", onResize);

  let frame: number;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, W, H);

    particles.forEach(p => {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < REPEL_DIST && dist > 0) {
        const force = (1 - dist / REPEL_DIST) * REPEL_FORCE;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const maxSpeed = 2.5;
      if (speed > maxSpeed) { p.vx = (p.vx / speed) * maxSpeed; p.vy = (p.vy / speed) * maxSpeed; }
      p.vx *= 0.985; p.vy *= 0.985;

      if (speed < SPEED * 0.3) {
        p.vx += (Math.random() - 0.5) * 0.05;
        p.vy += (Math.random() - 0.5) * 0.05;
      }

      p.x += p.vx; p.y += p.vy;

      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      const nearMouse = Math.max(0, 1 - dist / REPEL_DIST);
      p.r = p.baseR + nearMouse * 2.5;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 70%, 72%, ${0.55 + nearMouse * 0.45})`;
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECT_DIST) {
          const alpha = (1 - d / CONNECT_DIST) * 0.45;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(140, 200, 255, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    if (mouse.x > 0) {
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, REPEL_DIST, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(100, 180, 255, 0.06)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    frame = requestAnimationFrame(draw);
  }

  draw();

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("resize", onResize);
  };
}

// ── App ───────────────────────────────────────────────────
function App() {
  const [tasks, setTasks]         = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [deadlineValue, setDeadlineValue] = useState(""); 
  const confettiRef  = useRef<HTMLCanvasElement>(null);
  const particleRef  = useRef<HTMLCanvasElement>(null);

  // Memicu re-render berkala agar sisa waktu deadline ter-update otomatis
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  // Boot particle field
  useEffect(() => {
    if (!particleRef.current) return;
    const cleanup = initParticleField(particleRef.current);
    return cleanup;
  }, []);

  // Confetti canvas resize
  useEffect(() => {
    const onResize = () => {
      if (confettiRef.current) {
        confettiRef.current.width  = window.innerWidth;
        confettiRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const addTask = useCallback(() => {
    if (inputValue.trim() === "") return;
    const finalDeadline = deadlineValue || new Date().toISOString().split('T')[0];

    setTasks(prev => [...prev, { 
      id: Date.now(), 
      title: inputValue.trim(), 
      status: "todo",
      deadline: finalDeadline
    }]);

    setInputValue("");
    setDeadlineValue("");
  }, [inputValue, deadlineValue]);

  const moveTask = useCallback((taskId: number, newStatus: ColumnType) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    if (newStatus === "done" && confettiRef.current) {
      launchConfetti(confettiRef.current);
    }
  }, []);

  const deleteTask = useCallback((taskId: number) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  const getDeadlineStatus = (deadlineStr: string, status: "todo" | "doing" | "done") => {
    if (status === "done") return { text: "Completed", class: "dl-done" };

    const today = new Date();
    today.setHours(0,0,0,0);
    const deadlineDate = new Date(deadlineStr);
    deadlineDate.setHours(0,0,0,0);

    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)}d`, class: "dl-overdue" };
    } else if (diffDays === 0) {
      return { text: "Due Today", class: "dl-urgent" };
    } else if (diffDays === 1) {
      return { text: "Due Tomorrow", class: "dl-warning" };
    } else {
      return { text: `${diffDays} days left`, class: "dl-normal" };
    }
  };

  const getByStatus = (s: ColumnType) => {
    return tasks
      .filter(t => t.status === s)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  };

  const columns: ColumnType[] = ["todo", "doing", "done"];

  return (
    <div className="app-bg">
      <canvas ref={particleRef} className="particle-canvas" />
      <canvas ref={confettiRef} className="confetti-canvas" />

      <div className="content">
        <div className="header">
        </div>

        <h1 className="app-title">Todo Board</h1>
        <p className="app-subtitle">Tasks: {tasks.length} · Personal assistant workspace</p>

        <div className="input-row">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTask()}
            placeholder="Tambah task baru:"
            className="task-input"
          />
          <div className="date-input-wrap">
            <label className="date-label">Deadline:</label>
            <input 
              type="date"
              value={deadlineValue}
              onChange={e => setDeadlineValue(e.target.value)}
              className="task-date-input"
            />
          </div>
          <button onClick={addTask} className="add-btn">+ Add</button>
        </div>

        <div className="summary-row">
          <span className="badge badge-blue">Todo: {getByStatus("todo").length}</span>
          <span className="badge badge-amber">Doing: {getByStatus("doing").length}</span>
          <span className="badge badge-green">Done: {getByStatus("done").length}</span>
        </div>

        <div className="board">
          {columns.map(status => {
            const config   = columnConfig[status];
            const colTasks = getByStatus(status);
            return (
              <div key={status} className={`col ${config.accent}`}>
                <div className="col-header">
                  <span className="col-title">
                    <i className={`ti ${config.icon}`} aria-hidden="true"></i>
                    {config.title}
                  </span>
                  <span className="col-count">{colTasks.length}</span>
                </div>
                <div className="task-list">
                  {colTasks.length === 0 ? (
                    <p className="empty-state">No tasks yet</p>
                  ) : (
                    colTasks.map(task => {
                      const dl = getDeadlineStatus(task.deadline, task.status);
                      return (
                        <div key={task.id} className="task-card">
                          <p className="task-title">{task.title}</p>
                          
                          <div className={`task-deadline ${dl.class}`}>
                            <i className="ti ti-clock" aria-hidden="true"></i> {dl.text}
                          </div>

                          <div className="task-actions">
                            {status !== "todo" && (
                              <button
                                className="btn btn-back"
                                onClick={() => moveTask(task.id, status === "doing" ? "todo" : "doing")}
                              >← Back</button>
                            )}
                            {status !== "done" && (
                              <button
                                className="btn btn-next"
                                onClick={() => moveTask(task.id, status === "todo" ? "doing" : "done")}
                              >Next →</button>
                            )}
                            <button className="btn btn-del" onClick={() => deleteTask(task.id)}>
                              <i className="ti ti-trash" aria-hidden="true"></i>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;