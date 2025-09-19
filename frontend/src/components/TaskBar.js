import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Avatar, Menu, MenuItem, Tooltip } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

function TaskBar({ username, profilePhoto, onLogout }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogoutClick = () => {
    handleMenuClose();
    onLogout();
  };
  const handlePrivateChatClick = () => {
    navigate('/private/select');
  };

  // Generate avatar source
  const avatarSrc = (() => {
    if (!profilePhoto) return undefined;
    if (profilePhoto.startsWith('http')) return profilePhoto;
    return `http://localhost:5000/${profilePhoto.replace(/^\/+/, '')}`;
  })();

  return (
    <AppBar position="fixed" sx={{ bgcolor: '#121212', zIndex: 1300, boxShadow: '0 3px 15px rgba(111,66,193,0.8)' }}>
      <Toolbar sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
        <IconButton component={Link} to="/group" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 1 }}>
          ChatMaster
        </Typography>
        <Button
          component={Link}
          to="/"
          color="inherit"
          sx={{
            fontWeight: location.pathname === '/' ? 'bold' : 'normal',
            textDecoration: location.pathname === '/' ? 'underline' : 'none',
          }}
        >
          Home
        </Button>
        <Button
          component={Link}
          to="/group"
          color="inherit"
          sx={{
            fontWeight: location.pathname === '/group' ? 'bold' : 'normal',
            textDecoration: location.pathname === '/group' ? 'underline' : 'none',
          }}
        >
          Group Chat
        </Button>
        <Button
          component={Link}
          to="/groups"
          color="inherit"
          sx={{
            fontWeight: location.pathname === '/groups' ? 'bold' : 'normal',
            textDecoration: location.pathname === '/groups' ? 'underline' : 'none',
          }}
        >
          Groups
        </Button>
        <Button
          color="inherit"
          onClick={handlePrivateChatClick}
          sx={{
            fontWeight: location.pathname.startsWith('/private') ? 'bold' : 'normal',
            textDecoration: location.pathname.startsWith('/private') ? 'underline' : 'none',
          }}
        >
          Private Chat
        </Button>
        <Button
          component={Link}
          to="/profile"
          color="inherit"
          sx={{
            fontWeight: location.pathname === '/profile' ? 'bold' : 'normal',
            textDecoration: location.pathname === '/profile' ? 'underline' : 'none',
          }}
        >
          Profile
        </Button>
        <Button
          component={Link}
          to="/settings"
          color="inherit"
          sx={{
            fontWeight: location.pathname === '/settings' ? 'bold' : 'normal',
            textDecoration: location.pathname === '/settings' ? 'underline' : 'none',
          }}
        >
          Settings
        </Button>
        <Tooltip title={username}>
          <IconButton color="inherit" onClick={handleMenuOpen} sx={{ ml: 2 }}>
            <Avatar
              src={avatarSrc}
              sx={{ bgcolor: '#7b5cf5', border: '2px solid #9562e2' }}
            >
              {!avatarSrc && username.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              bgcolor: '#1e1e2f',
              color: '#c4befe',
              borderRadius: 2,
              mt: 1,
              minWidth: 130,
              boxShadow: '0 4px 12px #7c4bee',
            },
          }}
        >
          <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>Profile</MenuItem>
          <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default TaskBar;
