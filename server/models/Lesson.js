const mongoose = require('mongoose');
module.exports = mongoose.model('lesson', new mongoose.Schema({
    title: { type: String, required: true },
    module: { type: String, required: true },
    order: { type: Number, required: true },
    content: { type: String, required: true },
    codeSnippet: String,
    language: String
}));