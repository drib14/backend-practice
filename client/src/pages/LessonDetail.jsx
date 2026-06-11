import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper, Grid, Divider } from '@mui/material';
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

    if (!lesson) return <Typography sx={{ mt: 5, ml: 5 }}>Loading...</Typography>;

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" color="primary" fontWeight="bold">{lesson.title}</Typography>
                <Button component={Link} to="/lessons" variant="outlined" color="primary">Back to Courses</Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={5}>
                    <Paper sx={{ p: 4, height: 'calc(100vh - 180px)', overflow: 'auto', backgroundColor: 'background.paper', borderRadius: 2 }}>
                        <Box sx={{ '& h1': { color: '#10b981', mb: 3, fontSize: '2rem' }, '& p': { fontSize: '1.1rem', lineHeight: 1.6 } }}>
                            <ReactMarkdown>{lesson.content}</ReactMarkdown>
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        <Box sx={{ p: 3, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', borderRadius: 1 }}>
                            <Typography variant="h6" gutterBottom color="primary">Exercise</Typography>
                            <Typography variant="body1" paragraph>Try modifying the code in the editor to see how it works!</Typography>
                            <Button variant="contained" color={completed ? "success" : "primary"} onClick={markComplete}>
                                {completed ? "Completed!" : "Mark as Complete"}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={7}>
                    <Paper sx={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <Box sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <Typography variant="h6" color="secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                Try it Yourself
                            </Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1, '& > div': { height: '100% !important', borderRadius: '0 0 8px 8px' } }}>
                            <CodePlayground defaultLanguage={lesson.language} defaultCode={lesson.codeSnippet} />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default LessonDetail;
