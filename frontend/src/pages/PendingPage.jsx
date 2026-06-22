import React, { useMemo, useState ,handleLogout} from "react";
import { layoutClasses, SORT_OPTIONS } from "../assets/dummy";
import { Clock, Filter, ListChecks, Plus} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import TaskItem from "../components/TaskItem";
import TaskModel from "../components/TaskModel";

const PendingPage = () => {
  const { tasks = [], refreshTasks } = useOutletContext();
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTask, setSelectTask] = useState(null);
  const [showModal, setshowModal] = useState(false);

  //   const getHeaders=()=>{
  //   const token = localStorage.getItem('token')
  //   if(!token) throw new Error("No auth token found")
  //     return{'Content-Type':'application/json', Authorization :`Bearer ${token}`}
  // }
  const sortedPendingTasks = useMemo(() => {
    const filtered = tasks.filter(
      (t) =>
        !t.completed ||
        (typeof t.completed === "string" && t.completed.toLowerCase() === "no"),
    );

    return filtered.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      const order = { high: 3, medium: 2, low: 1 };
      return order[b.priority.toLowerCase()] - order[a.priority.toLowerCase()];
    });
  }, [tasks, sortBy]);

  return (
    <div className={layoutClasses.container}>
      <div className={layoutClasses.headerWrapper}>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ListChecks className="text-purple-500" />
            Pending Task
          </h1>
          <p className="text-sm text-gray-500 mt-1 m1-7">
            {sortedPendingTasks.lenght}task
            {sortedPendingTasks.lenght !== 1 && "s"} needing your attention
          </p>
        </div>
        <div className={layoutClasses.sortBox}>
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <Filter className="w-4 h-4 text-purple-500" />
            <span className="text-sm">Sort by:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={layoutClasses.select}
          >
            <option value="neweast">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">By First</option>
          </select>
          <div className={layoutClasses.tabWrapper}>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id)}
                className={layoutClasses.tabButton()}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={layoutClasses.addBox} onClick={() => setshowModal(true)}>
        <div className="flex items-center justify-center gap-3 text-gray-500 group-hover:text-purple-600 transition-colors">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
            <Plus className="text-purple-500" size={18} />
          </div>
          <span className="font-medium">Add New Task</span>
        </div>
      </div>
      <div className="space-y-4">
        {sortedPendingTasks.length === 0 ? (
          <div className={layoutClasses.emptyState}>
            <div className="max-w-xs mx-auto py-6">
              <div className={layoutClasses.emptyIconBg}>
                <Clock className="w-3 h-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                All caught up!
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                No Pending tasks-great work!
              </p>
              <button
                onClick={() => setshowModal(true)}
                className={layoutClasses.emptyBtn}
              >
                {" "}
                create New Task
              </button>
            </div>
          </div>
        ) : (
          sortedPendingTasks.map((task) => (
            <TaskItem
              key={task._id || task.id}
              task={task}
              showCompleteCheckbox
              onDelete={() => handleDelete(task._id || task.id)}
              onToggleComplete={() =>
                handleToggleComplete(task._id || task.id, t.completed)
              }
              onEdit={() => {
                setSelectTask(task);
                setshowModal(true);
              }}
              onRefresh={refreshTasks}
            />
          ))
        )}
      </div>
      <TaskModel
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectTask(null);
        }}
        taskoEdit={selectedTask}
        onSave={() => {
          refreshTasks();
        }}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default PendingPage;
