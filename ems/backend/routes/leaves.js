const router = require('express').Router();
const auth = require('../middleware/auth');
const Leave = require('../models/Leave');

router.get('/', auth, async (req, res) => {
  try {
    const { employeeId, status } = req.query;
    let query = {};
    if (employeeId) query.employee = employeeId;
    if (status) query.status = status;
    const leaves = await Leave.find(query).populate('employee', 'name department role').sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const leave = await Leave.create(req.body);
    await leave.populate('employee', 'name department role');
    res.status(201).json(leave);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('employee', 'name department role');
    res.json(leave);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
