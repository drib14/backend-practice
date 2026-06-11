const mongoose = require('mongoose');
module.exports = mongoose.model('progress', new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    completedLessons: [{ lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'lesson' }, completedAt: { type: Date, default: Date.now } }],
    completedQuizzes: [{ quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'quiz' }, score: Number, completedAt: { type: Date, default: Date.now } }]
}));