import { useState } from "react";
import './App.css'

type Task = {
  id: number;
  title: string;
  status: "todo" | "doing" | "done";
};

type ColumnType = "todo" | "doing" | "done";

const columnConfig: Record<ColumnType, { title: string; icon: string; accent: string }> = {
  todo:  { title: "To Do",       icon: "ti-clipboard-list", accent: "col-blue"   },
  doing: { title: "In Progress", icon: "ti-flame",          accent: "col-amber"  },
  done:  { title: "Done",        icon: "ti-circle-check",   accent: "col-green"  },
};

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState("");

  const addTask = () => {
    if (inputValue.trim() === "") return;
    const newTask: Task = { id: Date.now(), title: inputValue.trim(), status: "todo" };
    setTasks([...tasks, newTask]);
    setInputValue("");
  };

  const moveTask = (taskId: number, newStatus: ColumnType) => {
    setTasks(tasks.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const getTasksByStatus = (status: ColumnType) => tasks.filter((t) => t.status === status);
  const columns: ColumnType[] = ["todo", "doing", "done"];

  return (
    <div className="app-bg">
      

      {/* Header */}
      <h1 className="app-title">Todo Board</h1>
      <p className="app-subtitle">Tasks: {tasks.length} &nbsp;·&nbsp; Personal assistant workspace</p>

      {/* Input */}
      <div className="input-row">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Tambah task baru..."
          className="task-input"
        />
        <button onClick={addTask} className="add-btn">+ Add</button>
      </div>

      {/* Summary badges */}
      <div className="summary-row">
        <span className="badge badge-blue">Todo: {getTasksByStatus("todo").length}</span>
        <span className="badge badge-amber">Doing: {getTasksByStatus("doing").length}</span>
        <span className="badge badge-green">Done: {getTasksByStatus("done").length}</span>
      </div>

      {/* Board */}
      <div className="board">
        {columns.map((status) => {
          const config = columnConfig[status];
          const columnTasks = getTasksByStatus(status);
          return (
            <div key={status} className={`col ${config.accent}`}>
              <div className="col-header">
                <span className="col-title">
                  <i className={`ti ${config.icon}`}></i>
                  {config.title}
                </span>
                <span className="col-count">{columnTasks.length}</span>
              </div>

              <div className="task-list">
                {columnTasks.length === 0 ? (
                  <p className="empty-state">No tasks yet</p>
                ) : (
                  columnTasks.map((task) => (
                    <div key={task.id} className="task-card">
                      <p className="task-title">{task.title}</p>
                      <div className="task-actions">
                        {status !== "todo" && (
                          <button
                            onClick={() => moveTask(task.id, status === "doing" ? "todo" : "doing")}
                            className="btn btn-back"
                          >← Back</button>
                        )}
                        {status !== "done" && (
                          <button
                            onClick={() => moveTask(task.id, status === "todo" ? "doing" : "done")}
                            className="btn btn-next"
                          >Next →</button>
                        )}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="btn btn-del"
                        >
                          <i className="ti ti-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;