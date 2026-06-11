import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Lessons = () => {
    const { api } = useContext(AuthContext);
    const [lessons, setLessons] = useState([]);
    const [quizzes, setQuizzes] = useState([]);

    useEffect(() => {
        api.get('/lessons').then(res => setLessons(res.data)).catch(console.error);
        api.get('/progress/quizzes').then(res => setQuizzes(res.data)).catch(console.error);
    }, [api]);

    return (
        <Container sx={{ mt: 5 }}>
            <Typography variant="h3" color="primary" gutterBottom>Course Catalog</Typography>
            <Grid container spacing={3}>
                {lessons.map(lesson => (
                    <Grid item xs={12} sm={6} md={4} key={lesson._id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">{lesson.title}</Typography>
                                <Typography color="textSecondary">{lesson.module} - Lesson {lesson.order}</Typography>
                                <Button component={Link} to={`/lessons/${lesson._id}`} variant="contained" sx={{ mt: 2 }}>Start Lesson</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Typography variant="h4" color="secondary" sx={{ mt: 5, mb: 2 }}>Available Quizzes</Typography>
            <Grid container spacing={3}>
                {quizzes.map(quiz => (
                    <Grid item xs={12} sm={6} md={4} key={quiz._id}>
                        <Card sx={{ border: '1px solid #ec4899' }}>
                            <CardContent>
                                <Typography variant="h5" color="secondary">{quiz.title}</Typography>
                                <Typography color="textSecondary">{quiz.module} Module</Typography>
                                <Button component={Link} to={`/quiz/${quiz._id}`} variant="outlined" color="secondary" sx={{ mt: 2 }}>Take Quiz</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};
export default Lessons;
