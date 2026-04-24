const router = require('express').Router();
const auth = require('../middleware/auth');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');

router.get('/', auth, async (req, res) => {
  try {
    const { search, department, role } = req.query;
    let query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (department) query.department = department;
    if (role) query.role = role;
    const employees = await Employee.find(query).populate('department', 'name').sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const emp = await Employee.create(req.body);
    await emp.populate('department', 'name');
    res.status(201).json(emp);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const emp = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('department', 'name');
    res.json(emp);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get employee performance
router.get('/:id/performance', auth, async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id).populate('department', 'name');
    const attendance = await Attendance.find({ employee: req.params.id });
    const tasks = await Task.find({ employee: req.params.id });
    const present = attendance.filter(a => a.status === 'Present').length;
    const attendancePct = attendance.length ? Math.round((present / attendance.length) * 100) : 0;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const taskPct = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
    let performance = 'Average';
    if (attendancePct >= 85 && taskPct >= 75) performance = 'High Performer';
    else if (attendancePct < 60 || taskPct < 40) performance = 'Needs Improvement';
    const salary = emp.salary;
    const salaryPerDay = salary / 30;
    const finalSalary = Math.round(salaryPerDay * present);
    res.json({ employee: emp, attendancePct, taskPct, performance, daysPresent: present, finalSalary, totalTasks: tasks.length, completedTasks: completed });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Dashboard stats
router.get('/stats/dashboard', auth, async (req, res) => {
  try {
    const total = await Employee.countDocuments();
    const byDept = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $project: { count: 1, name: { $arrayElemAt: ['$dept.name', 0] } } }
    ]);
    const bySalary = await Employee.aggregate([
      { $group: { _id: '$department', avgSalary: { $avg: '$salary' } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $project: { avgSalary: 1, name: { $arrayElemAt: ['$dept.name', 0] } } }
    ]);
    const today = new Date().toISOString().split('T')[0];
    const todayAtt = await Attendance.find({ date: today });
    const presentToday = todayAtt.filter(a => a.status === 'Present').length;
    res.json({ total, byDept, bySalary, presentToday, absentToday: total - presentToday });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
