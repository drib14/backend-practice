import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Box, Paper, CircularProgress, List, ListItem, ListItemText, LinearProgress, Grid } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Dashboard = () => {
    const { user, api } = useContext(AuthContext);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            api.get('/progress')
                .then(res => setProgress(res.data))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [user, api]);

    if (!user) return null;
    if (loading) return <Container sx={{ mt: 5, textAlign: 'center' }}><CircularProgress /></Container>;

    const lessonsCompleted = progress?.completedLessons?.length || 0;
    const quizzesCompleted = progress?.completedQuizzes?.length || 0;

    return (
        <Container sx={{ mt: 5 }}>
            <Typography variant="h3" color="primary" gutterBottom>Hello, {user.name}</Typography>
            <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>Welcome to your learning dashboard.</Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 4 }}>
                        <Typography variant="h5" gutterBottom><CheckCircleIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />Course Progress</Typography>
                        <Box sx={{ mt: 2, mb: 2 }}>
                            <Typography variant="body1">Lessons Completed: {lessonsCompleted}</Typography>
                        </Box>
                        <List>
                            {progress?.completedLessons?.slice(0, 5).map((l, idx) => (
                                <ListItem key={idx} divider>
                                    <ListItemText
                                        primary={l.lessonId ? l.lessonId.title : 'Lesson'}
                                        secondary={`Completed: ${new Date(l.completedAt).toLocaleDateString()}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 4 }}>
                        <Typography variant="h5" gutterBottom>Quiz Scores</Typography>
                        <Box sx={{ mt: 2, mb: 2 }}>
                            <Typography variant="body1">Quizzes Taken: {quizzesCompleted}</Typography>
                        </Box>
                        <List>
                            {progress?.completedQuizzes?.slice(0, 5).map((q, idx) => (
                                <ListItem key={idx} divider>
                                    <ListItemText
                                        primary={q.quizId ? q.quizId.title : 'Quiz'}
                                        secondary={`Score: ${q.score}% | ${new Date(q.completedAt).toLocaleDateString()}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;
