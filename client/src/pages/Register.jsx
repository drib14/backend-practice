import React, { useState, useContext } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';

const Register = () => {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState(null);

    const { name, email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await register({ name, email, password });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.errors?.[0]?.msg || err[0]?.msg || err.message || 'Registration failed');
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 10, position: 'relative' }}><Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, opacity: 0.3 }}><Canvas camera={{ position: [0, 0, 5] }}><ambientLight intensity={0.5} /><directionalLight position={[10, 10, 5]} intensity={1} /><Sphere args={[1, 64, 64]} scale={2}><MeshDistortMaterial color="#10b981" distort={0.4} speed={2} roughness={0.2} /></Sphere><OrbitControls autoRotate enableZoom={false} /></Canvas></Box>
            <Paper elevation={3} sx={{ p: 5, borderRadius: 3 }}>
                <Typography variant="h4" align="center" gutterBottom color="primary">Register</Typography>
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                <form onSubmit={onSubmit}>
                    <TextField fullWidth label="Name" name="name" value={name} onChange={onChange} margin="normal" required />
                    <TextField fullWidth label="Email" name="email" type="email" value={email} onChange={onChange} margin="normal" required />
                    <TextField fullWidth label="Password" name="password" type="password" value={password} onChange={onChange} margin="normal" required />
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Sign Up</Button>
                </form>
            </Paper>
        </Container>
    );
};

export default Register;
