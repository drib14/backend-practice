import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    return (
        <AppBar position="static" sx={{ backgroundColor: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Toolbar>
                <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>DevMastery</Typography>
                <Button color="inherit" component={Link} to="/lessons">Courses</Button>
                {user ? (
                    <><Button color="inherit" component={Link} to="/dashboard">Dashboard</Button><Button color="inherit" onClick={logout}>Logout</Button></>
                ) : (
                    <><Button color="inherit" component={Link} to="/login">Login</Button><Button color="inherit" component={Link} to="/register">Register</Button></>
                )}
            </Toolbar>
        </AppBar>
    );
}