import React, { useState } from 'react';
import { Button, TextField, Typography, Container } from '@mui/material';

const Auth = ({ chatId, onAuthorized }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const handleAuthorize = () => {
        // Mock authorization logic
        const isAuthorized = code === "1234"; // Replace with your actual logic
        if (isAuthorized) {
            onAuthorized();
        } else {
            setError('Authorization failed.');
        }
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Authorization
            </Typography>
            <TextField
                label="Registration Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                fullWidth
                margin="normal"
            />
            <Button variant="contained" color="primary" onClick={handleAuthorize}>
                Authorize
            </Button>
            {error && <Typography color="error">{error}</Typography>}
        </Container>
    );
};

export default Auth;
