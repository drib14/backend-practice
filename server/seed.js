const mongoose = require('mongoose');
const connectDB = async () => { await mongoose.connect(process.env.MONGO_URI); };
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');
require('dotenv').config({ path: './server/.env' });

const lessonsData = [
    // HTML Module
    { title: "HTML Introduction", module: "HTML", order: 1, content: "# HTML Introduction\nHTML is the standard markup language for creating Web pages. It describes the structure of a Web page using markup.\n\nHTML elements are the building blocks of HTML pages.", codeSnippet: "<!DOCTYPE html>\n<html>\n<head>\n<title>Page Title</title>\n</head>\n<body>\n\n<h1>My First Heading</h1>\n<p>My first paragraph.</p>\n\n</body>\n</html>", language: "html" },
    { title: "HTML Attributes", module: "HTML", order: 2, content: "# HTML Attributes\nAttributes provide additional information about HTML elements.\n\nAll HTML elements can have attributes. Attributes are always specified in the start tag.", codeSnippet: "<a href=\"https://www.google.com\">Visit Google</a>\n<img src=\"img_girl.jpg\" width=\"500\" height=\"600\">", language: "html" },
    { title: "HTML Forms", module: "HTML", order: 3, content: "# HTML Forms\nAn HTML form is used to collect user input. The user input is most often sent to a server for processing.", codeSnippet: "<form>\n  <label for=\"fname\">First name:</label><br>\n  <input type=\"text\" id=\"fname\" name=\"fname\"><br>\n  <label for=\"lname\">Last name:</label><br>\n  <input type=\"text\" id=\"lname\" name=\"lname\">\n</form>", language: "html" },

    // CSS Module
    { title: "CSS Introduction", module: "CSS", order: 1, content: "# CSS Introduction\nCSS stands for Cascading Style Sheets. CSS describes how HTML elements are to be displayed on screen, paper, or in other media.", codeSnippet: "body {\n  background-color: lightblue;\n}\n\nh1 {\n  color: white;\n  text-align: center;\n}", language: "css" },
    { title: "CSS Box Model", module: "CSS", order: 2, content: "# CSS Box Model\nAll HTML elements can be considered as boxes. The CSS box model is essentially a box that wraps around every HTML element. It consists of: margins, borders, padding, and the actual content.", codeSnippet: "div {\n  width: 300px;\n  border: 15px solid green;\n  padding: 50px;\n  margin: 20px;\n}", language: "css" },
    { title: "CSS Flexbox", module: "CSS", order: 3, content: "# CSS Flexbox\nThe Flexible Box Layout Module makes it easier to design flexible responsive layout structure without using float or positioning.", codeSnippet: ".flex-container {\n  display: flex;\n  background-color: DodgerBlue;\n}\n\n.flex-container > div {\n  background-color: #f1f1f1;\n  margin: 10px;\n  padding: 20px;\n  font-size: 30px;\n}", language: "css" },

    // JavaScript Module
    { title: "JS Variables", module: "JavaScript", order: 1, content: "# JavaScript Variables\nVariables are containers for storing data values. In JavaScript, you can declare variables with `var`, `let`, or `const`.", codeSnippet: "let x = 5;\nlet y = 6;\nlet z = x + y;\nconsole.log('The value of z is: ' + z);", language: "javascript" },
    { title: "JS Functions", module: "JavaScript", order: 2, content: "# JavaScript Functions\nA JavaScript function is a block of code designed to perform a particular task. A JavaScript function is executed when 'something' invokes it (calls it).", codeSnippet: "function myFunction(p1, p2) {\n  return p1 * p2;\n}\nconsole.log(myFunction(4, 3));", language: "javascript" },
    { title: "JS Array Methods", module: "JavaScript", order: 3, content: "# JavaScript Arrays\nArrays are used to store multiple values in a single variable. JS provides many methods to manipulate arrays.", codeSnippet: "const fruits = ['Banana', 'Orange', 'Apple', 'Mango'];\nfruits.push('Kiwi');\nconsole.log(fruits);", language: "javascript" },

    // React Module
    { title: "React Intro", module: "React", order: 1, content: "# React Introduction\nReact is a declarative, efficient, and flexible JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called 'components'.", codeSnippet: "import React from 'react';\n\nfunction Welcome(props) {\n  return <h1>Hello, {props.name}</h1>;\n}\n\n// Note: This editor evaluates standard JS, so React syntax requires a build step.\nconsole.log('React uses JSX!');", language: "javascript" },

    // Node Module
    { title: "Node.js Intro", module: "Node.js", order: 1, content: "# Node.js\nNode.js is an open-source, cross-platform, back-end JavaScript runtime environment that runs on the V8 engine and executes JavaScript code outside a web browser.", codeSnippet: "const http = require('http');\n\n// Create a server object\n/*\nhttp.createServer(function (req, res) {\n  res.write('Hello World!');\n  res.end();\n}).listen(8080);\n*/\nconsole.log('Node is running!');", language: "javascript" },

    // Python Module
    { title: "Python Basics", module: "Python", order: 1, content: "# Python Basics\nPython is a popular programming language. It was created by Guido van Rossum, and released in 1991.", codeSnippet: "print('Hello, World!')\n\nif 5 > 2:\n  print('Five is greater than two!')", language: "python" }
];

const quizzesData = [
    { module: "HTML", title: "HTML Basics Quiz", questions: [{ questionText: "Choose the correct HTML element for the largest heading:", options: [{ text: "<h1>", isCorrect: true }, { text: "<h6>", isCorrect: false }, { text: "<head>", isCorrect: false }, { text: "<heading>", isCorrect: false }], explanation: "<h1> defines the most important (and usually largest) heading." }] },
    { module: "CSS", title: "CSS Fundamentals", questions: [{ questionText: "How do you insert a comment in a CSS file?", options: [{ text: "/* this is a comment */", isCorrect: true }, { text: "// this is a comment", isCorrect: false }, { text: "' this is a comment", isCorrect: false }], explanation: "CSS comments start with /* and end with */" }] },
    { module: "JavaScript", title: "JS Core Quiz", questions: [{ questionText: "Inside which HTML element do we put the JavaScript?", options: [{ text: "<script>", isCorrect: true }, { text: "<javascript>", isCorrect: false }, { text: "<js>", isCorrect: false }], explanation: "The <script> tag is used to embed or reference executable code." }] }
];

const seedData = async () => {
    try {
        await connectDB();
        await Lesson.deleteMany(); await Quiz.deleteMany();
        await Lesson.insertMany(lessonsData); await Quiz.insertMany(quizzesData);
        console.log('Database comprehensively seeded!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
seedData();
