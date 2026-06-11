const mongoose = require('mongoose');
const connectDB = async () => { await mongoose.connect(process.env.MONGO_URI); };
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');
require('dotenv').config();

const lessonsData = [
    { title: "HTML Basics", module: "HTML", order: 1, content: "# Welcome to HTML\nHTML is the standard markup language for creating Web pages.", codeSnippet: "<h1>Hello World!</h1>", language: "html" },
    { title: "CSS Styling", module: "CSS", order: 1, content: "# Styling with CSS\nCSS describes how HTML elements are to be displayed.", codeSnippet: "body { background-color: lightblue; }", language: "css" },
    { title: "JavaScript Functions", module: "JavaScript", order: 1, content: "# Functions in JS\nFunctions are reusable blocks of code.", codeSnippet: "function sayHello() { console.log('Hello!'); }", language: "javascript" }
];

const quizzesData = [
    { module: "HTML", title: "HTML Quiz", questions: [{ questionText: "What does HTML stand for?", options: [{ text: "Hyper Text Markup Language", isCorrect: true }, { text: "Home Tool Markup Language", isCorrect: false }], explanation: "HTML is Hyper Text Markup Language." }] }
];

const seedData = async () => {
    try {
        await connectDB();
        await Lesson.deleteMany(); await Quiz.deleteMany();
        await Lesson.insertMany(lessonsData); await Quiz.insertMany(quizzesData);
        console.log('Database seeded successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
seedData();
