import React, { useState } from "react";
import { Box, Typography, TextField, Button, Alert, Paper } from "@mui/material";
import axios from "axios";

function RequestReset() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/request-reset", { email });
      setMsg("If the email exists, a reset link has been sent.");
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email");
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a192f', // Match your app background
        px: 2,
      }}
    >
      <Paper
        sx={{
          maxWidth: 400,
          width: "100%",
          p: 4,
          borderRadius: 3,
          bgcolor: 'rgba(30, 50, 70, 0.90)',
          boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
        }}
      >
        <Typography variant="h5" mb={3} color="white" textAlign="center">
          Request Password Reset
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            variant="filled"
            InputLabelProps={{ style: { color: '#A0C8F0' } }}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 1,
              input: { color: 'white' },
            }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default RequestReset;
