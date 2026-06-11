const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');

router.get('/', async (req, res) => {
    try { res.json(await Lesson.find().sort({ module: 1, order: 1 }).select('-content')); } catch (err) { res.status(500).send('Server Error'); }
});

router.get('/:id', async (req, res) => {
    try { res.json(await Lesson.findById(req.params.id)); } catch (err) { res.status(500).send('Server Error'); }
});
module.exports = router;