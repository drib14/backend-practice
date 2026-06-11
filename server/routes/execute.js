const express = require('express');
const router = express.Router();
const axios = require('axios');

let cachedRuntimes = null;

router.post('/', async (req, res) => {
    const { language, sourceCode } = req.body;
    try {
        const langMap = { 'javascript': 'node', 'python': 'python', 'html': 'html', 'css': 'css' };
        const pistonLang = langMap[language.toLowerCase()] || language;

        if (!cachedRuntimes) {
            const runtimesRes = await axios.get('https://emacs.piston.rs/api/v2/runtimes');
            cachedRuntimes = runtimesRes.data;
        }
        const runtime = cachedRuntimes.find(r => r.language === pistonLang || r.aliases.includes(pistonLang));

        if (!runtime) return res.status(400).json({ msg: 'Unsupported language' });

        const response = await axios.post('https://emacs.piston.rs/api/v2/execute', {
            language: runtime.language, version: runtime.version, files: [{ content: sourceCode }]
        });

        res.json({ output: response.data.run.output });
    } catch (error) { res.status(500).json({ msg: 'Error executing code' }); }
});
module.exports = router;