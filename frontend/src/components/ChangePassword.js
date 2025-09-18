import React, { useState } from 'react';
import { Box, TextField, Button, Alert } from '@mui/material';
import axios from 'axios';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Assuming your API requires a token in Authorization header
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/change-password', 
        { currentPassword, newPassword }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleChangePassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <TextField
        type="password"
        label="Current Password"
        required
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        variant="filled"
        InputLabelProps={{ style: { color: '#A0C8F0' } }}
        sx={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1, input: { color: 'white' } }}
      />
      <TextField
        type="password"
        label="New Password"
        required
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        variant="filled"
        InputLabelProps={{ style: { color: '#A0C8F0' } }}
        sx={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1, input: { color: 'white' } }}
      />
      <TextField
        type="password"
        label="Confirm New Password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        variant="filled"
        InputLabelProps={{ style: { color: '#A0C8F0' } }}
        sx={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1, input: { color: 'white' } }}
      />
      <Button type="submit" variant="contained" color="secondary" disabled={loading} sx={{ py: 1.2, fontWeight: 'bold' }}>
        {loading ? 'Changing...' : 'Change Password'}
      </Button>
    </Box>
  );
};

export default ChangePassword;
