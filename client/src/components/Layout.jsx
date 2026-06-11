import React from 'react';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1201 }}>
                <Navbar />
            </Box>
            <Box sx={{ display: 'flex', flex: 1, mt: 8 }}>
                <Sidebar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - 280px)` }, ml: { sm: '280px' }, overflow: 'auto' }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default Layout;
