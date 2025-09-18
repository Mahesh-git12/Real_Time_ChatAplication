// src/components/ThemeSwitcher.js
import React from "react";
import { FormControlLabel, Switch, Box, Typography } from "@mui/material";

function ThemeSwitcher({ darkMode, setDarkMode }) {
  const handleChange = (event) => {
    setDarkMode(event.target.checked);
    localStorage.setItem("darkMode", JSON.stringify(event.target.checked));
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", my: 4 }}>
      <Typography variant="h5" mb={2}>
        Theme Preferences
      </Typography>
      <FormControlLabel
        control={<Switch checked={darkMode} onChange={handleChange} />}
        label="Enable Dark Mode"
      />
    </Box>
  );
}

export default ThemeSwitcher;
