import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { AuthContext } from '../context/AuthContext';
import CodePlayground from '../components/CodePlayground';

const LessonDetail = () => {
    const { id } = useParams();
    const { api, user } = useContext(AuthContext);
    const [lesson, setLesson] = useState(null);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        api.get(`/lessons/${id}`).then(res => setLesson(res.data)).catch(console.error);
        if (user) {
             api.get('/progress').then(res => {
                 setCompleted(res.data.completedLessons.some(l => l.lessonId && (l.lessonId._id || l.lessonId).toString() === id));
             });
        }
    }, [id, api, user]);

    const markComplete = async () => {
        if (!user) return alert("Login to save progress");
        await api.post(`/progress/lesson/${id}`);
        setCompleted(true);
    };

    if (!lesson) return <Typography>Loading...</Typography>;

    return (
        <Container sx={{ mt: 5 }}>
            <Button component={Link} to="/lessons" sx={{ mb: 2 }}>Back</Button>
            <Typography variant="h3" color="primary">{lesson.title}</Typography>
            <Paper sx={{ p: 4, mt: 3, mb: 3 }}>
                <ReactMarkdown>{lesson.content}</ReactMarkdown>
                <Button variant="contained" color={completed ? "success" : "primary"} onClick={markComplete} sx={{ mt: 3 }}>
                    {completed ? "Completed" : "Mark as Complete"}
                </Button>
            </Paper>
            <Typography variant="h5" color="secondary" gutterBottom>Interactive Playground</Typography>
            <CodePlayground defaultLanguage={lesson.language} defaultCode={lesson.codeSnippet} />
        </Container>
    );
};
export default LessonDetail;
