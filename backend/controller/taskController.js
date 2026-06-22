import Task from "../model/taskModel.js";
// new task
// export const createTask = async (req, res) => {
//   try {
//     const { title, description, priority, dueDate, completed } = req.body;
//     const task = newTask({
//       title,
//       description,
//       priority,
//       dueDate,
//       completed: completed === "Yes" || completed === true,
//       owner: req.user.id,
//     });
//     const saved = await task.save();
//     res.status(201).json({ success: true, task: saved });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// };
export const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, completed } = req.body;

    const newTask = await Task.create({
      title,
      description,
      priority,
      dueDate,
      completed,
      owner: req.user.id, // ✅ REQUIRED
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


//get all task for login - in user
export const getTask = async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
// get single task bye id (must belong to that user)
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
    if (!task)
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    res.json({ success: true, task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

//update a task
export const updateTask = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.completed !== undefined) {
      data.completed = data.completed === "Yes" || data.completed == true;
    }
    const update = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      data,
      { new: true, runValidators: true }
    );
    if (!update)
      return res.status(404).json({
        success: false,
        message: "Task not found or not yours",
      });
    res.json({ success: true, task: update });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
// delete a task
export const deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!deleted)
      return res.status(404).json({
        success: false,
        message: "Task not found or not yours",
      });
    res.json({ success: true, task: "Task deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
