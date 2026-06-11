import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, Typography, Paper, CircularProgress, Tabs, Tab } from '@mui/material';
import Editor from '@monaco-editor/react';
import { AuthContext } from '../context/AuthContext';
export default function CodePlayground({ defaultLanguage = 'html', defaultCode = '' }) {
    const { api } = useContext(AuthContext);
    const [code, setCode] = useState(defaultCode);
    const [language, setLanguage] = useState(defaultLanguage);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [activeTab, setActiveTab] = useState(defaultLanguage === 'html' ? 1 : 0);

    useEffect(() => {
        setCode(defaultCode);
        setLanguage(defaultLanguage);
        setActiveTab(defaultLanguage === 'html' ? 1 : 0);
        setOutput('');
    }, [defaultCode, defaultLanguage]);

    const runBackend = async () => {
        setIsRunning(true); setActiveTab(0);
        try { const res = await api.post('/execute', { language, sourceCode: code }); setOutput(res.data.output); }
        catch (err) { setOutput('Error executing code'); }
        setIsRunning(false);
    };

    const runFrontend = () => {
        setActiveTab(1);
        setTimeout(() => {
            const iframe = document.getElementById('preview-frame');
            if (iframe) { iframe.contentDocument.open(); iframe.contentDocument.write(code); iframe.contentDocument.close(); }
        }, 50);
    };

    return (
        <Paper elevation={3} sx={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
                <Typography>{language.toUpperCase()} Editor</Typography>
                <Button variant="contained" onClick={['html','css'].includes(language) ? runFrontend : runBackend}>{isRunning ? 'Running...' : 'Run Code'}</Button>
            </Box>
            <Box sx={{ display: 'flex', flexGrow: 1 }}>
                <Box sx={{ width: '50%' }}><Editor language={language} theme="vs-dark" value={code} onChange={setCode} /></Box>
                <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
                    <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                        <Tab label="Console" /><Tab label="Preview" />
                    </Tabs>
                    <Box sx={{ flexGrow: 1, p: 2 }}>
                        {activeTab === 0 ? <pre>{output}</pre> : <iframe id="preview-frame" style={{ width: '100%', height: '100%', border: 'none', background: 'white' }} />}
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
}