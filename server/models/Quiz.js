const mongoose = require('mongoose');
module.exports = mongoose.model('quiz', new mongoose.Schema({
    module: { type: String, required: true },
    title: { type: String, required: true },
    questions: [{
        questionText: { type: String, required: true },
        options: [{ text: String, isCorrect: Boolean }],
        explanation: String
    }]
}));