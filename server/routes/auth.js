const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendEmail, welcomeEmailTemplate, passwordResetTemplate } = require('../utils/email');

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        user = new User({ name, email, password });
        user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
        await user.save();
        const token = jwt.sign({ user: { id: user.id } }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        sendEmail({ email, subject: 'Welcome', html: welcomeEmailTemplate(name) });
        res.json({ token });
    } catch (err) { res.status(500).send('Server error'); }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        const token = jwt.sign({ user: { id: user.id } }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) { res.status(500).send('Server error'); }
});

router.get('/me', auth, async (req, res) => {
    try { res.json(await User.findById(req.user.id).select('-password')); } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/forgot-password', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.json({ msg: 'If that email exists, a link has been sent.' });
        const token = jwt.sign({ user: { id: user.id } }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        await sendEmail({ email: user.email, subject: 'Password Reset', html: passwordResetTemplate(token) });
        res.json({ msg: 'If that email exists, a link has been sent.' });
    } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/reset-password/:token', async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, process.env.ACCESS_TOKEN_SECRET);
        let user = await User.findById(decoded.user.id);
        if (!user) return res.status(400).json({ msg: 'Invalid token' });
        user.password = await bcrypt.hash(req.body.password, await bcrypt.genSalt(10));
        await user.save();
        res.json({ msg: 'Password updated successfully' });
    } catch (err) { res.status(400).json({ msg: 'Invalid or expired token' }); }
});

module.exports = router;