import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';

const Home = () => {
    return (
        <Box sx={{ position: 'relative', height: 'calc(100vh - 64px)' }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                 <Canvas camera={{ position: [0, 0, 5] }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <Sphere args={[1, 64, 64]} scale={2}>
                        <MeshDistortMaterial color="#6366f1" distort={0.4} speed={2} roughness={0.2} />
                    </Sphere>
                    <OrbitControls autoRotate />
                </Canvas>
            </Box>
            <Container sx={{ position: 'relative', zIndex: 1, pt: 10, textAlign: 'center' }}>
                <Typography variant="h2" fontWeight="bold">Welcome to DevMastery</Typography>
                <Typography variant="h5" sx={{ mt: 2 }}>Interactive Web Development Platform</Typography>
            </Container>
        </Box>
    );
};

export default Home;
