import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const Quiz = () => {
    const { id } = useParams();
    const { api, user } = useContext(AuthContext);
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(null);

    useEffect(() => {
        api.get(`/progress/quiz/${id}`).then(res => setQuiz(res.data)).catch(console.error);
    }, [id, api]);

    const submit = async () => {
        let calculated = 0;
        quiz.questions.forEach((q, i) => { if (answers[i] !== undefined && q.options[answers[i]].isCorrect) calculated++; });
        const finalScore = Math.round((calculated / quiz.questions.length) * 100);
        setScore(finalScore);
        if (user) await api.post(`/progress/quiz/${id}`, { score: finalScore });
    };

    if (!quiz) return <Typography>Loading...</Typography>;
    if (score !== null) return (
        <Container sx={{ mt: 5, textAlign: 'center' }}>
            <Typography variant="h3">Score: {score}%</Typography>
            <Button component={Link} to="/lessons" variant="contained" sx={{ mt: 3 }}>Back to Courses</Button>
        </Container>
    );

    return (
        <Container sx={{ mt: 5 }}>
            <Typography variant="h3" color="primary">{quiz.title}</Typography>
            {quiz.questions.map((q, i) => (
                <Paper key={i} sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h6">{q.questionText}</Typography>
                    <RadioGroup value={answers[i] ?? ''} onChange={e => setAnswers({...answers, [i]: parseInt(e.target.value)})}>
                        {q.options.map((opt, oIdx) => <FormControlLabel key={oIdx} value={oIdx} control={<Radio />} label={opt.text} />)}
                    </RadioGroup>
                </Paper>
            ))}
            <Button variant="contained" onClick={submit} sx={{ mt: 3 }}>Submit</Button>
        </Container>
    );
};
export default Quiz;
