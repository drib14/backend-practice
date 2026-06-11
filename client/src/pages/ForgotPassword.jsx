import React, { useState, useContext } from 'react';
import { Container, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const ForgotPassword = () => {
    const { forgotPassword } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState(null);

    const onSubmit = async e => {
        e.preventDefault();
        try { setMsg(await forgotPassword(email)); } catch (err) { setMsg('Error sending request'); }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 10 }}>
            <Paper sx={{ p: 5 }}>
                <Typography variant="h4" gutterBottom>Forgot Password</Typography>
                {msg && <Alert severity="info" sx={{ mb: 3 }}>{msg}</Alert>}
                <form onSubmit={onSubmit}>
                    <TextField fullWidth label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <Button type="submit" variant="contained" sx={{ mt: 3 }}>Send Reset Link</Button>
                </form>
            </Paper>
        </Container>
    );
};
export default ForgotPassword;
