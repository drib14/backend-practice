import React, { useState, useContext } from 'react';
import { Container, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { resetPassword } = useContext(AuthContext);
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState(null);

    const onSubmit = async e => {
        e.preventDefault();
        try {
            setMsg(await resetPassword(token, password));
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) { setMsg('Error resetting password'); }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 10 }}>
            <Paper sx={{ p: 5 }}>
                <Typography variant="h4" gutterBottom>Reset Password</Typography>
                {msg && <Alert severity="info" sx={{ mb: 3 }}>{msg}</Alert>}
                <form onSubmit={onSubmit}>
                    <TextField fullWidth label="New Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <Button type="submit" variant="contained" sx={{ mt: 3 }}>Update Password</Button>
                </form>
            </Paper>
        </Container>
    );
};
export default ResetPassword;
