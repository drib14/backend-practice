const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Progress = require('../models/Progress');
const Quiz = require('../models/Quiz');

router.get('/', auth, async (req, res) => {
    try {
        let p = await Progress.findOne({ user: req.user.id }).populate('completedLessons.lessonId', ['title', 'module']).populate('completedQuizzes.quizId', ['title', 'module']);
        if (!p) { p = new Progress({ user: req.user.id }); await p.save(); }
        res.json(p);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/lesson/:id', auth, async (req, res) => {
    try {
        let p = await Progress.findOne({ user: req.user.id });
        if (!p) p = new Progress({ user: req.user.id });
        if (!p.completedLessons.some(l => l.lessonId && l.lessonId.toString() === req.params.id)) {
            p.completedLessons.unshift({ lessonId: req.params.id });
            await p.save();
        }
        res.json(p);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.get('/quizzes', async (req, res) => {
    try { res.json(await Quiz.find().select('title module')); } catch (err) { res.status(500).send('Server Error'); }
});

router.get('/quiz/:id', async (req, res) => {
    try { res.json(await Quiz.findById(req.params.id)); } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/quiz/:id', auth, async (req, res) => {
    try {
        let p = await Progress.findOne({ user: req.user.id });
        if (!p) p = new Progress({ user: req.user.id });
        p.completedQuizzes = p.completedQuizzes.filter(q => q.quizId && q.quizId.toString() !== req.params.id);
        p.completedQuizzes.unshift({ quizId: req.params.id, score: req.body.score });
        await p.save();
        res.json(p);
    } catch (err) { res.status(500).send('Server Error'); }
});
module.exports = router;