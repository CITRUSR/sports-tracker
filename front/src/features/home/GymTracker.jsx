import { useState, useEffect } from "react";

const theme = {
  primary: "#3B5BF5",
  primaryLight: "#EEF1FF",
  purple: "#9B59F5",
  gradient: "linear-gradient(135deg, #3B5BF5 0%, #9B59F5 100%)",
  bg: "#F0F2F8",
  card: "#FFFFFF",
  text: "#1A1D2E",
  textMuted: "#8B91A8",
  border: "#E4E7F0",
  success: "#22C55E",
  orange: "#F59E0B",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Manrope', sans-serif; background: ${theme.bg}; color: ${theme.text}; }

  .app { min-height: 100vh; }

  /* Header */
  .header {
    background: white;
    border-bottom: 1px solid ${theme.border};
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    position: sticky; top: 0; z-index: 100;
  }
  .logo { display: flex; align-items: center; gap: 10px; }
  .logo-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: ${theme.gradient};
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 16px;
  }
  .logo-text { font-weight: 800; font-size: 16px; line-height: 1.1; }
  .logo-sub { font-size: 11px; color: ${theme.textMuted}; font-weight: 500; }

  .btn-primary {
    background: ${theme.primary};
    color: white; border: none; border-radius: 10px;
    padding: 10px 20px; font-family: 'Manrope', sans-serif;
    font-weight: 700; font-size: 14px; cursor: pointer;
    display: flex; align-items: center; gap: 6px;
    transition: all 0.2s; box-shadow: 0 4px 12px rgba(59,91,245,0.3);
  }
  .btn-primary:hover { background: #2a4ae0; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(59,91,245,0.4); }
  .btn-outline {
    background: transparent; color: ${theme.primary};
    border: 2px solid ${theme.primary}; border-radius: 10px;
    padding: 10px 20px; font-family: 'Manrope', sans-serif;
    font-weight: 700; font-size: 14px; cursor: pointer;
    transition: all 0.2s;
  }
  .btn-outline:hover { background: ${theme.primaryLight}; }

  /* Nav */
  .nav { display: flex; gap: 4px; padding: 0 32px; background: white; border-bottom: 1px solid ${theme.border}; }
  .nav-tab {
    padding: 16px 16px; font-size: 14px; font-weight: 600;
    color: ${theme.textMuted}; cursor: pointer; border: none; background: none;
    font-family: 'Manrope', sans-serif;
    border-bottom: 2px solid transparent; margin-bottom: -1px;
    display: flex; align-items: center; gap: 6px; transition: all 0.2s;
  }
  .nav-tab.active { color: ${theme.primary}; border-bottom-color: ${theme.primary}; }
  .nav-tab:hover:not(.active) { color: ${theme.text}; }

  /* Main */
  .main { padding: 32px; max-width: 1200px; margin: 0 auto; }
  .page-title { font-size: 28px; font-weight: 800; margin-bottom: 6px; }
  .page-sub { font-size: 14px; color: ${theme.textMuted}; margin-bottom: 28px; }

  /* Stats grid */
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
  .stat-card {
    background: white; border-radius: 16px; padding: 20px;
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .stat-label { font-size: 12px; color: ${theme.textMuted}; font-weight: 600; margin-bottom: 6px; }
  .stat-val { font-size: 26px; font-weight: 800; }
  .stat-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; font-size: 18px;
  }

  /* Favorite banner */
  .fav-banner {
    background: ${theme.gradient};
    border-radius: 16px; padding: 24px 28px;
    display: flex; align-items: center; gap: 16px;
    margin-bottom: 20px; color: white;
  }
  .fav-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(255,255,255,0.2); display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0; }
  .fav-label { font-size: 12px; opacity: 0.8; font-weight: 600; margin-bottom: 4px; }
  .fav-val { font-size: 22px; font-weight: 800; }

  /* Quick action cards */
  .action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .action-card {
    background: white; border-radius: 16px; padding: 28px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .action-icon { font-size: 28px; margin-bottom: 14px; }
  .action-title { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
  .action-desc { font-size: 13px; color: ${theme.textMuted}; margin-bottom: 20px; line-height: 1.5; }

  /* Empty state */
  .empty-card {
    background: white; border-radius: 16px; padding: 60px;
    text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .empty-icon { font-size: 48px; opacity: 0.3; margin-bottom: 16px; }
  .empty-title { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
  .empty-desc { font-size: 13px; color: ${theme.textMuted}; margin-bottom: 20px; }

  /* Workouts page */
  .search-bar {
    background: white; border: 1.5px solid ${theme.border}; border-radius: 12px;
    padding: 12px 16px; font-family: 'Manrope', sans-serif; font-size: 14px;
    flex: 1; outline: none; color: ${theme.text};
    transition: border-color 0.2s;
  }
  .search-bar:focus { border-color: ${theme.primary}; }
  .filter-select {
    background: white; border: 1.5px solid ${theme.border}; border-radius: 12px;
    padding: 12px 16px; font-family: 'Manrope', sans-serif; font-size: 14px;
    color: ${theme.text}; cursor: pointer; outline: none; min-width: 160px;
  }
  .search-row { display: flex; gap: 12px; margin-bottom: 20px; }

  .workout-card {
    background: white; border-radius: 16px; padding: 20px 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04); margin-bottom: 12px;
    display: flex; align-items: center; justify-content: space-between;
    transition: box-shadow 0.2s; cursor: pointer;
  }
  .workout-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
  .workout-date { font-size: 13px; color: ${theme.textMuted}; font-weight: 600; margin-bottom: 4px; }
  .workout-exercises { font-size: 13px; color: ${theme.textMuted}; }
  .workout-name { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .workout-badge {
    background: ${theme.primaryLight}; color: ${theme.primary};
    font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 8px;
  }
  .workout-duration { font-size: 14px; color: ${theme.textMuted}; font-weight: 600; }

  /* New workout form */
  .form-card { background: white; border-radius: 16px; padding: 28px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
  .form-section-title { font-size: 17px; font-weight: 800; margin-bottom: 20px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-group { margin-bottom: 16px; }
  .form-label { font-size: 13px; font-weight: 700; color: ${theme.textMuted}; margin-bottom: 8px; display: block; }
  .form-input {
    width: 100%; background: ${theme.bg}; border: 1.5px solid ${theme.border};
    border-radius: 10px; padding: 12px 14px; font-family: 'Manrope', sans-serif;
    font-size: 14px; color: ${theme.text}; outline: none; transition: border-color 0.2s;
  }
  .form-input:focus { border-color: ${theme.primary}; background: white; }
  .form-textarea { resize: none; height: 100px; }

  .exercise-card {
    border: 1.5px solid ${theme.border}; border-radius: 12px;
    padding: 18px; margin-bottom: 12px;
  }
  .exercise-label { font-size: 13px; font-weight: 700; color: ${theme.textMuted}; margin-bottom: 14px; }
  .exercise-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 10px; align-items: end; }

  .btn-add-ex {
    background: none; border: 2px dashed ${theme.border};
    border-radius: 10px; padding: 12px; width: 100%;
    font-family: 'Manrope', sans-serif; font-size: 13px; font-weight: 700;
    color: ${theme.textMuted}; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .btn-add-ex:hover { border-color: ${theme.primary}; color: ${theme.primary}; background: ${theme.primaryLight}; }

  .btn-danger {
    background: none; border: none; color: #EF4444; cursor: pointer;
    font-size: 18px; padding: 4px; transition: opacity 0.2s;
  }
  .btn-danger:hover { opacity: 0.7; }

  .back-btn {
    background: none; border: none; cursor: pointer; color: ${theme.textMuted};
    font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 14px;
    display: flex; align-items: center; gap: 6px; margin-bottom: 16px;
    transition: color 0.2s;
  }
  .back-btn:hover { color: ${theme.text}; }

  /* Progress page */
  .progress-card { background: white; border-radius: 16px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); margin-bottom: 16px; }
  .ex-selector { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
  .ex-chip {
    padding: 8px 16px; border-radius: 100px; font-size: 13px; font-weight: 700;
    cursor: pointer; border: 2px solid ${theme.border}; background: white;
    font-family: 'Manrope', sans-serif; transition: all 0.2s; color: ${theme.textMuted};
  }
  .ex-chip.active { background: ${theme.primary}; border-color: ${theme.primary}; color: white; }
  .ex-chip:hover:not(.active) { border-color: ${theme.primary}; color: ${theme.primary}; }

  .chart-wrap { position: relative; height: 220px; display: flex; align-items: flex-end; gap: 8px; padding: 16px 0 0; }
  .chart-bar-group { display: flex; flex-direction: column; align-items: center; flex: 1; gap: 4px; }
  .chart-bar {
    width: 100%; border-radius: 8px 8px 0 0;
    background: ${theme.gradient}; transition: height 0.5s cubic-bezier(.34,1.56,.64,1);
    min-height: 4px;
  }
  .chart-bar-label { font-size: 10px; color: ${theme.textMuted}; font-weight: 700; text-align: center; }
  .chart-bar-val { font-size: 11px; font-weight: 800; color: ${theme.primary}; }
  .chart-y-axis { position: absolute; left: 0; top: 0; bottom: 24px; display: flex; flex-direction: column; justify-content: space-between; }
  .chart-y-label { font-size: 10px; color: ${theme.textMuted}; }

  /* Notification */
  .toast {
    position: fixed; bottom: 24px; right: 24px;
    background: ${theme.text}; color: white;
    padding: 14px 20px; border-radius: 12px; font-size: 14px; font-weight: 700;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2); z-index: 999;
    animation: slideUp 0.3s ease;
  }
  @keyframes slideUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }

  @media (max-width: 768px) {
    .stats-grid { grid-template-columns: repeat(2,1fr); }
    .action-grid { grid-template-columns: 1fr; }
    .exercise-grid { grid-template-columns: 1fr 1fr; }
    .form-row { grid-template-columns: 1fr; }
    .main { padding: 16px; }
    .header { padding: 0 16px; }
    .nav { padding: 0 16px; }
  }
`;

const SAMPLE_WORKOUTS = [];



function StatCard({ label, value, icon, iconBg }) {
  return (
    <div className="stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-val">{value}</div>
      </div>
      <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
    </div>
  );
}

function HomePage({ workouts, onStart, onProgress }) {
  const totalVol = workouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets * e.reps * e.weight, 0), 0);
  const avgDur = workouts.length ? Math.round(workouts.reduce((a, w) => a + w.duration, 0) / workouts.length) : 0;
  const exCounts = {};
  workouts.forEach(w => w.exercises.forEach(e => { exCounts[e.name] = (exCounts[e.name] || 0) + 1; }));
  const fav = Object.entries(exCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return (
    <div className="main">
      <div className="page-title">Добро пожаловать! 👋</div>
      <div className="page-sub">Отслеживайте свой прогресс и достигайте новых высот</div>

      <div className="stats-grid">
        <StatCard label="Всего тренировок" value={workouts.length} icon="📅" iconBg="#EEF1FF" />
        <StatCard label="Упражнений выполнено" value={workouts.reduce((a, w) => a + w.exercises.length, 0)} icon="⚡" iconBg="#ECFDF5" />
        <StatCard label="Общий объём" value={`${totalVol} кг`} icon="📈" iconBg="#F5F0FF" />
        <StatCard label="Средняя длительность" value={`${avgDur} мин`} icon="⏱" iconBg="#FFF7ED" />
      </div>

      <div className="fav-banner">
        <div className="fav-icon">🏆</div>
        <div>
          <div className="fav-label">Ваше любимое упражнение</div>
          <div className="fav-val">{fav || "Нет данных"}</div>
        </div>
      </div>

      <div className="action-grid">
        <div className="action-card">
          <div className="action-icon">🏋️</div>
          <div className="action-title">Новая тренировка</div>
          <div className="action-desc">Начните записывать новую тренировку и отслеживайте прогресс</div>
          <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={onStart}>
            Начать тренировку
          </button>
        </div>
        <div className="action-card">
          <div className="action-icon" style={{ color: theme.purple }}>📊</div>
          <div className="action-title">Прогресс</div>
          <div className="action-desc">Просматривайте детальную статистику по каждому упражнению</div>
          <button className="btn-outline" style={{ width: "100%", justifyContent: "center" }} onClick={onProgress}>
            Посмотреть прогресс
          </button>
        </div>
      </div>

      {workouts.length === 0 && (
        <div className="empty-card">
          <div className="empty-icon">🏋️</div>
          <div className="empty-title">Начните свой путь</div>
          <div className="empty-desc">Добавьте первую тренировку, чтобы начать отслеживать прогресс</div>
          <button className="btn-primary" onClick={onStart}>Добавить первую тренировку</button>
        </div>
      )}
    </div>
  );
}

function WorkoutsPage({ workouts, onAdd }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date");

  const filtered = workouts
    .filter(w => w.exercises.some(e => e.name.toLowerCase().includes(search.toLowerCase())) || search === "")
    .sort((a, b) => sort === "date" ? new Date(b.date) - new Date(a.date) : b.duration - a.duration);

  const formatDate = (d) => {
    const dt = new Date(d);
    return dt.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
  };

  return (
    <div className="main">
      <div className="page-title">Мои тренировки</div>
      <div className="page-sub">История всех тренировок ({workouts.length})</div>

      <div className="search-row">
        <input className="search-bar" placeholder="🔍  Поиск по упражнениям..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="date">По дате</option>
          <option value="duration">По длительности</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-card">
          <div className="empty-icon">📋</div>
          <div className="empty-title">У вас пока нет тренировок</div>
          <div className="empty-desc">Добавьте первую тренировку</div>
          <button className="btn-primary" onClick={onAdd}>+ Добавить тренировку</button>
        </div>
      ) : (
        filtered.map(w => (
          <div className="workout-card" key={w.id}>
            <div>
              <div className="workout-date">{formatDate(w.date)}</div>
              <div className="workout-name">{w.exercises.map(e => e.name).join(", ").slice(0, 50) + (w.exercises.map(e => e.name).join(", ").length > 50 ? "..." : "")}</div>
              <div className="workout-exercises">{w.exercises.length} упражнений · {w.exercises.reduce((a, e) => a + e.sets, 0)} подходов</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="workout-badge">{w.duration} мин</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ProgressPage({ workouts }) {
  const exNames = [...new Set(workouts.flatMap(w => w.exercises.map(e => e.name)))];
  const [selected, setSelected] = useState(exNames[0] || null);

  useEffect(() => { if (exNames.length && !selected) setSelected(exNames[0]); }, [workouts]);

  const getChartData = () => {
    if (!selected) return [];
    return workouts
      .filter(w => w.exercises.some(e => e.name === selected))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-8)
      .map(w => {
        const ex = w.exercises.find(e => e.name === selected);
        return { date: new Date(w.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }), vol: ex.sets * ex.reps * ex.weight };
      });
  };

  const data = getChartData();
  const max = data.length ? Math.max(...data.map(d => d.vol)) : 1;

  return (
    <div className="main">
      <div className="page-title">Прогресс 📈</div>
      <div className="page-sub">Отслеживайте прогресс по каждому упражнению</div>

      {workouts.length === 0 ? (
        <div className="empty-card">
          <div className="empty-icon">📊</div>
          <div className="empty-title">Нет данных</div>
          <div className="empty-desc">Добавьте тренировки, чтобы увидеть графики прогресса</div>
        </div>
      ) : (
        <div className="progress-card">
          <div className="form-section-title">Выберите упражнение</div>
          <div className="ex-selector">
            {exNames.map(name => (
              <button key={name} className={`ex-chip ${selected === name ? "active" : ""}`} onClick={() => setSelected(name)}>{name}</button>
            ))}
          </div>

          {data.length > 0 ? (
            <>
              <div style={{ fontSize: 13, color: theme.textMuted, fontWeight: 700, marginBottom: 8 }}>Объём (кг × повторения × подходы)</div>
              <div className="chart-wrap">
                {data.map((d, i) => (
                  <div className="chart-bar-group" key={i}>
                    <div className="chart-bar-val">{d.vol}</div>
                    <div className="chart-bar" style={{ height: `${(d.vol / max) * 160}px` }} />
                    <div className="chart-bar-label">{d.date}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", color: theme.textMuted, padding: "40px 0" }}>Нет данных для этого упражнения</div>
          )}
        </div>
      )}
    </div>
  );
}

function NewWorkoutPage({ onSave, onCancel }) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState([{ id: 1, name: "", sets: 3, reps: 10, weight: 0 }]);

  const addEx = () => setExercises([...exercises, { id: Date.now(), name: "", sets: 3, reps: 10, weight: 0 }]);
  const removeEx = (id) => { if (exercises.length > 1) setExercises(exercises.filter(e => e.id !== id)); };
  const updateEx = (id, field, val) => setExercises(exercises.map(e => e.id === id ? { ...e, [field]: val } : e));

  const handleSave = () => {
    const validEx = exercises.filter(e => e.name.trim());
    if (!validEx.length) return alert("Добавьте хотя бы одно упражнение с названием");
    onSave({ id: Date.now(), date, duration: Number(duration), notes, exercises: validEx });
  };

  return (
    <div className="main">
      <button className="back-btn" onClick={onCancel}>← Назад</button>
      <div className="page-title">Новая тренировка</div>
      <div className="page-sub" style={{ marginBottom: 24 }}>Добавьте результаты тренировки</div>

      <div className="form-card">
        <div className="form-section-title">Основная информация</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Дата тренировки</label>
            <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Длительность (минуты)</label>
            <input type="number" className="form-input" value={duration} onChange={e => setDuration(e.target.value)} min={1} />
          </div>
        </div>
      </div>

      <div className="form-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div className="form-section-title" style={{ marginBottom: 0 }}>Упражнения</div>
          <button className="btn-primary" onClick={addEx} style={{ padding: "8px 14px", fontSize: 13 }}>+ Добавить упражнение</button>
        </div>

        {exercises.map((ex, i) => (
          <div className="exercise-card" key={ex.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="exercise-label">Упражнение {i + 1}</div>
              {exercises.length > 1 && <button className="btn-danger" onClick={() => removeEx(ex.id)}>✕</button>}
            </div>
            <div className="exercise-grid">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Название</label>
                <input className="form-input" placeholder="Например, Жим штанги" value={ex.name} onChange={e => updateEx(ex.id, "name", e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Подходы</label>
                <input type="number" className="form-input" value={ex.sets} onChange={e => updateEx(ex.id, "sets", Number(e.target.value))} min={1} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Повторения</label>
                <input type="number" className="form-input" value={ex.reps} onChange={e => updateEx(ex.id, "reps", Number(e.target.value))} min={1} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Вес (кг)</label>
                <input type="number" className="form-input" value={ex.weight} onChange={e => updateEx(ex.id, "weight", Number(e.target.value))} min={0} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="form-card">
        <div className="form-section-title">Заметки (необязательно)</div>
        <textarea className="form-input form-textarea" placeholder="Добавьте заметки о тренировке..." value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn-primary" onClick={handleSave} style={{ flex: 1, justifyContent: "center", padding: "14px" }}>
          💾 Сохранить тренировку
        </button>
        <button className="btn-outline" onClick={onCancel} style={{ padding: "14px 24px" }}>Отмена</button>
      </div>
    </div>
  );
}


export default function App() {
  const [tab, setTab] = useState("home");
  const [view, setView] = useState("main"); // main | new
  const [workouts, setWorkouts] = useState(SAMPLE_WORKOUTS);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleSave = (w) => {
    setWorkouts(prev => [w, ...prev]);
    setView("main");
    setTab("workouts");
    showToast("✅ Тренировка сохранена!");
  };

  const navTabs = [
    { id: "home", icon: "🏠", label: "Главная" },
    { id: "workouts", icon: "📋", label: "Тренировки" },
    { id: "progress", icon: "📈", label: "Прогресс" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <header className="header">
          <div className="logo">
            <div className="logo-icon">🏋️</div>
            <div>
              <div className="logo-text">GymTracker</div>
              <div className="logo-sub">Учет результатов</div>
            </div>
          </div>
          <button className="btn-primary" onClick={() => { setView("new"); setTab("home"); }}>
            + Добавить тренировку
          </button>
        </header>

        {view === "main" && (
          <nav className="nav">
            {navTabs.map(t => (
              <button key={t.id} className={`nav-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
        )}

        {view === "new" ? (
          <NewWorkoutPage onSave={handleSave} onCancel={() => setView("main")} />
        ) : tab === "home" ? (
          <HomePage workouts={workouts} onStart={() => setView("new")} onProgress={() => setTab("progress")} />
        ) : tab === "workouts" ? (
          <WorkoutsPage workouts={workouts} onAdd={() => setView("new")} />
        ) : (
          <ProgressPage workouts={workouts} />
        )}

        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}
