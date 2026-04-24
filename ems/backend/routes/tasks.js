const router = require('express').Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

router.get('/', auth, async (req, res) => {
  try {
    const { employeeId, status } = req.query;
    let query = {};
    if (employeeId) query.employee = employeeId;
    if (status) query.status = status;
    const tasks = await Task.find(query).populate('employee', 'name department').sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const task = await Task.create(req.body);
    await task.populate('employee', 'name department');
    res.status(201).json(task);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('employee', 'name department');
    res.json(task);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Top performers
router.get('/stats/performers', auth, async (req, res) => {
  try {
    const performers = await Task.aggregate([
      { $group: { _id: '$employee', total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } } } },
      { $lookup: { from: 'employees', localField: '_id', foreignField: '_id', as: 'emp' } },
      { $project: { total: 1, completed: 1, name: { $arrayElemAt: ['$emp.name', 0] }, rate: { $multiply: [{ $divide: ['$completed', '$total'] }, 100] } } },
      { $sort: { rate: -1 } },
      { $limit: 10 }
    ]);
    res.json(performers);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
