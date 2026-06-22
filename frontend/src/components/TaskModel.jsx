import React, { useCallback, useState, useEffect } from "react";
import {
  baseControlClasses,
  DEFAULT_TASK,
  priorityStyles,
} from "../assets/dummy";
import { Calendar, PlusCircle, Save, X, AlignLeft, Flag } from "lucide-react";

const API_BASE = "http://localhost:4000/api/tasks";

const TaskModel = ({ isOpen, onClose, taskoEdit, onSave, onLogout }) => {
  const [taskData, setTaskData] = useState(DEFAULT_TASK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!isOpen) return;
    if (taskoEdit) {
      // Normalize completion status
      const isDone =
        taskoEdit.completed === "Yes" || taskoEdit.completed === true;
      setTaskData({
        ...DEFAULT_TASK,
        title: taskoEdit.title || "",
        description: taskoEdit.description || "",
        priority: taskoEdit.priority || "Low",
        dueDate: taskoEdit.dueDate?.split("T")[0] || "",
        completed: isDone ? "Yes" : "No",
        id: taskoEdit._id || taskoEdit.id,
      });
    } else {
      setTaskData(DEFAULT_TASK);
    }
    setError(null);
  }, [isOpen, taskoEdit]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth Token Found");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (taskData.dueDate < today) {
        setError("Due date cannot be in the past.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const isEdit = Boolean(taskData.id);
        const url = isEdit ? `${API_BASE}/${taskData.id}/gp` : `${API_BASE}/gp`;

        // Convert the "Yes/No" string back to a Boolean for the Backend
        const payload = {
          ...taskData,
          completed: taskData.completed === "Yes",
        };

        const resp = await fetch(url, {
          method: isEdit ? "PUT" : "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });

        if (!resp.ok) {
          if (resp.status === 401) return onLogout?.();
          const err = await resp.json();
          throw new Error(err.message || "Failed to save task");
        }

        const saved = await resp.json();

        onSave?.(saved);

        onClose();
      } catch (err) {
        console.error(err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    },
    [taskData, today, getHeaders, onLogout, onSave, onClose],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-purple-100 rounded-xl max-w-md w-full shadow-2xl relative p-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {taskData.id ? (
              <>
                <Save className="text-purple-500 w-5 h-5" /> Edit Task
              </>
            ) : (
              <>
                <PlusCircle className="text-purple-500 w-5 h-5" /> Create New
                Task
              </>
            )}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-gray-500 hover:text-purple-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title
            </label>
            <input
              type="text"
              name="title"
              required
              value={taskData.title}
              onChange={handleChange}
              className="w-full border border-purple-100 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none text-sm transition-all"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              <AlignLeft className="w-4 h-4 text-purple-500" /> Description
            </label>
            <textarea
              name="description"
              rows="3"
              value={taskData.description}
              onChange={handleChange}
              className={baseControlClasses}
              placeholder="Add details about your task"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                <Flag className="w-4 h-4 text-purple-500" /> Priority
              </label>
              <select
                name="priority"
                value={taskData.priority}
                onChange={handleChange}
                className={`${baseControlClasses} ${priorityStyles[taskData.priority] || ""}`}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 text-purple-500" /> Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                required
                min={today}
                value={taskData.dueDate}
                onChange={handleChange}
                className={baseControlClasses}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex gap-4">
              {[
                { val: "Yes", label: "Completed" },
                { val: "No", label: "In Progress" },
              ].map(({ val, label }) => (
                <label key={val} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="completed"
                    value={val}
                    checked={taskData.completed === val}
                    onChange={handleChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg transition-all"
          >
            {loading ? (
              "Saving..."
            ) : taskData.id ? (
              <>
                <Save className="w-4 h-4" /> Update Task
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" /> Create Task
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskModel;
