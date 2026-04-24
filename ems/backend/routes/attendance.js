const router = require('express').Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

router.get('/', auth, async (req, res) => {
  try {
    const { date, employeeId } = req.query;
    let query = {};
    if (date) query.date = date;
    if (employeeId) query.employee = employeeId;
    const records = await Attendance.find(query).populate('employee', 'name department role').sort({ date: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Mark attendance for a date (bulk)
router.post('/mark', auth, async (req, res) => {
  try {
    const { date, records } = req.body; // records: [{employeeId, status}]
    const ops = records.map(r => ({
      updateOne: {
        filter: { employee: r.employeeId, date },
        update: { $set: { status: r.status } },
        upsert: true
      }
    }));
    await Attendance.bulkWrite(ops);
    res.json({ message: 'Attendance marked successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get summary for an employee
router.get('/summary/:employeeId', auth, async (req, res) => {
  try {
    const records = await Attendance.find({ employee: req.params.employeeId });
    const present = records.filter(r => r.status === 'Present').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const leave = records.filter(r => r.status === 'Leave').length;
    const pct = records.length ? Math.round((present / records.length) * 100) : 0;
    res.json({ total: records.length, present, absent, leave, percentage: pct, records });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
