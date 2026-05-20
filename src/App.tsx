import { useState } from "react";
import './App.css'

// Definisi tipe data untuk 1 task
type Task = {
  id: number;
  title: string;
  status: "todo" | "doing" | "done"; // hanya 3 nilai yang valid
};

// Tipe untuk column
type ColumnType = "todo" | "doing" | "done";

// Config untuk setiap column
const columnConfig: Record<
  ColumnType,
  { title: string; emoji: string; color: string }
> = {
  todo: { title: "To Do", emoji: "📋", color: "border-blue-500" },
  doing: { title: "In Progress", emoji: "🔥", color: "border-yellow-500" },
  done: { title: "Done", emoji: "✅", color: "border-green-500" },
};

function App() {
  // State: daftar semua task
  const [tasks, setTasks] = useState<Task[]>([]);
  // State: isi input field
  const [inputValue, setInputValue] = useState("");

  // --- Fungsi Add Task ---
  const addTask = () => {
    if (inputValue.trim() === "") return; // validasi jangan tambah kalau kosong

    const newTask: Task = {
      id: Date.now(), // ID unik dari timestamp
      title: inputValue.trim(), // ini tittle mksdnye isi inputannye ye
      status: "todo", // task baru langsung klo baru di add/newtask masuk "todo"
    };

    setTasks([...tasks, newTask]); // spread + tambah task baru
    setInputValue(""); // reset input
  };

  // Fungsi pindahkan task ke status berikutnya
  const moveTask = (taskId: number, newStatus: ColumnType) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task,
      ),
    );
  };

  // Fungsi hapus task
  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  // Filter tasks per column
  const getTasksByStatus = (status: ColumnType) => {
    return tasks.filter((task) => task.status === status);
  };

  const columns: ColumnType[] = ["todo", "doing", "done"];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-center mb-8">📋 Todo Board</h1>
      {/* Foto Profil */}
      <div
        className="flex justify-center mb-6"
        style={{ perspective: "800px" }}
      >
        <img
          src="public/background.png"
          alt="Foto Profil"
          className="coin-spin w-32 h-32 rounded-full object-cover border-4 border-cyan-500 shadow-lg shadow-cyan-500/30"
        />
      </div>
      <p className="text-center text-gray-400">
        Tasks: {tasks.length} | Input: "{inputValue}"
      </p>

      {/* Form Input */}
      <div className="max-w-md mx-auto flex gap-2 mb-8">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Tambah task baru..."
          className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700
                     focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <button
          onClick={addTask}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg
                     font-semibold transition-colors"
        >
          + Add
        </button>
      </div>

      {/* Summary Task */}
      <div className="flex justify-center gap-4 mb-6">
        <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm">
          📋 Todo: {getTasksByStatus("todo").length}
        </div>
        <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg text-sm">
          🔥 Doing: {getTasksByStatus("doing").length}
        </div>
        <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm">
          ✅ Done: {getTasksByStatus("done").length}
        </div>
      </div>

      {/* Board: 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {columns.map((status) => {
          const config = columnConfig[status];
          const columnTasks = getTasksByStatus(status);

          return (
            <div
              key={status}
              className={`bg-gray-800/50 rounded-xl p-4 border-t-4 ${config.color}
                          backdrop-blur-sm animate-slide-in`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">
                  {config.emoji} {config.title}
                </h2>
                <span className="bg-gray-700 text-xs px-2 py-1 rounded-full">
                  {columnTasks.length}
                </span>
              </div>

              {/* Task Cards */}
              <div className="space-y-2 min-h-[100px]">
                {columnTasks.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center py-8">
                    No tasks yet
                  </p>
                ) : (
                  columnTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-gray-700/50 rounded-lg p-3 hover:bg-gray-700
                                 transition-all group animate-fade-in"
                    >
                      <p className="text-sm mb-2">{task.title}</p>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Tombol Back (kecuali di todo) */}
                        {status !== "todo" && (
                          <button
                            onClick={() =>
                              moveTask(
                                task.id,
                                status === "doing" ? "todo" : "doing",
                              )
                            }
                            className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-500
                                       rounded transition-colors cursor-pointer"
                          >
                            ← Back
                          </button>
                        )}
                        {/* Tombol Next (kecuali di done) */}
                        {status !== "done" && (
                          <button
                            onClick={() =>
                              moveTask(
                                task.id,
                                status === "todo" ? "doing" : "done",
                              )
                            }
                            className="text-xs px-2 py-1 bg-cyan-600 hover:bg-cyan-500
                                       rounded transition-colors cursor-pointer"
                          >
                            Next →
                          </button>
                        )}
                        {/* Tombol Delete */}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-xs px-2 py-1 bg-red-600/50 hover:bg-red-600
                                     rounded transition-colors ml-auto cursor-pointer"
                        >
                          🗑
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

      {/* Debug: tampilkan tasks */}
      <pre className="text-xs text-gray-500 text-center mt-8">
        {JSON.stringify(tasks, null, 2)}
      </pre>
    </div>
  );
}

export default App;
