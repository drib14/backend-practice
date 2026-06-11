import React, { useState, useEffect, useContext } from 'react';
import { Box, Drawer, List, ListItem, ListItemText, Typography, Divider, Collapse, IconButton } from '@mui/material';
import { ExpandLess, ExpandMore, Menu as MenuIcon } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const drawerWidth = 280;

const Sidebar = () => {
    const { api } = useContext(AuthContext);
    const location = useLocation();
    const [lessons, setLessons] = useState([]);
    const [openModules, setOpenModules] = useState({});
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        api.get('/lessons')
           .then(res => setLessons(res.data))
           .catch(console.error);
    }, [api]);

    // Group lessons by module
    const modules = {};
    lessons.forEach(lesson => {
        if (!modules[lesson.module]) modules[lesson.module] = [];
        modules[lesson.module].push(lesson);
    });

    const handleToggle = (moduleName) => {
        setOpenModules(prev => ({ ...prev, [moduleName]: !prev[moduleName] }));
    };

    const drawerContent = (
        <Box sx={{ mt: 8, overflow: 'auto' }}>
            <Typography variant="h6" sx={{ p: 2, color: 'primary.main', fontWeight: 'bold' }}>
                Tutorials
            </Typography>
            <Divider />
            <List>
                {Object.keys(modules).map((moduleName) => (
                    <React.Fragment key={moduleName}>
                        <ListItem button onClick={() => handleToggle(moduleName)} sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                            <ListItemText primary={moduleName} primaryTypographyProps={{ fontWeight: 'bold' }} />
                            {openModules[moduleName] ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={openModules[moduleName]} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {modules[moduleName].map((lesson) => {
                                    const isSelected = location.pathname === `/lessons/${lesson._id}`;
                                    return (
                                        <ListItem
                                            button
                                            key={lesson._id}
                                            component={Link}
                                            to={`/lessons/${lesson._id}`}
                                            sx={{ pl: 4, backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'transparent', borderLeft: isSelected ? '4px solid #10b981' : '4px solid transparent' }}
                                        >
                                            <ListItemText primary={lesson.title} primaryTypographyProps={{ fontSize: '0.9rem', color: isSelected ? '#10b981' : 'inherit' }} />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Collapse>
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );

    return (
        <>
            <IconButton
                color="inherit"
                edge="start"
                onClick={() => setMobileOpen(!mobileOpen)}
                sx={{ position: 'fixed', top: 10, left: 10, zIndex: 1200, display: { sm: 'none' } }}
            >
                <MenuIcon />
            </IconButton>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid rgba(255,255,255,0.1)' },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </>
    );
};

export default Sidebar;