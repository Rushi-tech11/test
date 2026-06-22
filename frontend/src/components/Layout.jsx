import React, { useCallback, useEffect, useState, useMemo } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import axios from "axios";
import { Clock, TrendingUp, Circle, Zap } from "lucide-react";

const Layout = ({ onLogout, user }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        if (typeof onLogout === "function") onLogout();
        return;
      }

      const { data } = await axios.get("http://localhost:4000/api/tasks/gp", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.tasks)
        ? data.tasks
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setTasks(arr);
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not load tasks.");
      if (err.response?.status === 401 && typeof onLogout === "function")
        onLogout();
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const stats = useMemo(() => {
    const completedTasks = tasks.filter(
      (t) =>
        t.completed === true ||
        t.completed === 1 ||
        (typeof t.completed === "string" && t.completed.toLowerCase() === "yes")
    ).length;

    const totalCount = tasks.length;
    const pendingCount = totalCount - completedTasks;
    const completionPercentage = totalCount
      ? Math.round((completedTasks / totalCount) * 100)
      : 0;

    return {
      totalCount,
      completedTasks,
      pendingCount,
      completionPercentage,
    };
  }, [tasks]);

  const StatCard = ({ title, value, icon }) => (
    <div className="p-3 rounded-xl bg-white shadow-sm border border-purple-100 hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-100">{icon}</div>
        <div>
          <p className="text-lg font-bold text-purple-600">{value}</p>
          <p className="text-xs text-gray-500 font-medium">{title}</p>
        </div>
      </div>
    </div>
  );

  /* LOADING */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  /* ERROR */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          <p className="font-medium mb-2">Error loading tasks</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchTasks}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      <Sidebar user={user} tasks={tasks} />

      <div className="ml-0 md:ml-16 lg:ml-64 p-4 transition-all">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <Outlet context={{ tasks, refreshTasks: fetchTasks }} />
          </div>

          <div className="space-y-6">
            {/* STATISTICS */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                Task Statistics
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  title="Total Tasks"
                  value={stats.totalCount}
                  icon={<Circle className="text-purple-500 w-4 h-4" />}
                />
                <StatCard
                  title="Completed"
                  value={stats.completedTasks}
                  icon={<Circle className="text-green-500 w-4 h-4" />}
                />
                <StatCard
                  title="Pending"
                  value={stats.pendingCount}
                  icon={<Circle className="text-fuchsia-500 w-4 h-4" />}
                />
                <StatCard
                  title="Completion"
                  value={`${stats.completionPercentage}%`}
                  icon={<Zap className="text-purple-500 w-4 h-4" />}
                />
              </div>

              <div className="mt-4">
                <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-600 transition-all"
                    style={{
                      width: `${stats.completionPercentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5  sm:w-5 text-purple-500" />
                Recent Activity
              </h3>

              <div className="space-y-2 sm:space-y-3">
                {tasks.slice(0, 3).map((task) => (
                  <div
                    key={task._id || task.id}
                    className="flex items-center justify-between p-2  sm:p-3 rounded-lg hover:bg-purple-50/50 transition-colors duration-200 border border-transparent hover:border-purple-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {task.createdAt
                          ? new Date(task.createdAt).toLocaleDateString()
                          : "No date"}
                      </p>
                    </div>

                    <span
                      className={`px-2  py-1 text-xs rounded-full shrink-0 m1-2
                      ${
                        task.completed
                          ? "bg-green-100 text-green-700"
                          : "bg-fuchsia-100 text-fuchsia-700"
                      }`}
                    >
                      {task.completed ? "Done" : "Pending"}
                    </span>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="text-center py-4 sm:py-6 px-2">
                    <div
                      className="w-12 h-12 sm:w-16 sm:h-16 mx-auto sm:mb-4 rounded-full
                    bg-purple-100 flex justify-center items-center"
                    >
                      <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                    </div>
                    <p className="text-sm text-gray-500">No recent Activity</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Task will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
