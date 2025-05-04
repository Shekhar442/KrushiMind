import React from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import SchoolIcon from '@mui/icons-material/School';
import StoreIcon from '@mui/icons-material/Store';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleIcon from '@mui/icons-material/People';
import LanguageIcon from '@mui/icons-material/Language';
import WifiOffIcon from '@mui/icons-material/WifiOff';

const MenuButton = styled(Button)(({ theme, color }) => ({
  width: '95px',
  height: '95px',
  borderRadius: '5px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette[color].light,
  border: `1px solid ${theme.palette[color].main}`,
  '&:hover': {
    backgroundColor: theme.palette[color].lighter,
  },
}));

const IconWrapper = styled(Box)(({ theme, color }) => ({
  width: '75px',
  height: '50px',
  borderRadius: '5px',
  backgroundColor: theme.palette[color].main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '10px',
  color: 'white',
}));

const HomeScreen = ({ userName, onLanguageChange }) => {
  return (
    <Box sx={{ 
      width: '220px', 
      height: '400px', 
      bgcolor: 'white', 
      borderRadius: '10px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      p: 2
    }}>
      <Box sx={{ 
        height: '30px', 
        bgcolor: '#f0f0f0', 
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 2
      }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Home Screen
        </Typography>
      </Box>

      {/* Status Bar */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        p: 1,
        bgcolor: '#f0f0f0',
        borderRadius: '3px'
      }}>
        <WifiOffIcon sx={{ color: '#99cc99', mr: 1 }} />
        <Typography variant="caption">Offline Mode</Typography>
        
        <IconButton
          size="small"
          onClick={onLanguageChange}
          sx={{ 
            ml: 'auto',
            bgcolor: '#e8f5e9',
            border: '1px solid #4caf50',
            '&:hover': { bgcolor: '#e8f5e9' }
          }}
        >
          <LanguageIcon sx={{ fontSize: 16, color: '#333333' }} />
        </IconButton>
      </Box>

      {/* Welcome Section */}
      <Box sx={{ 
        bgcolor: '#e6f7e6',
        p: 2,
        borderRadius: '5px',
        mb: 2
      }}>
        <Typography variant="subtitle1" fontWeight="bold" color="#006600" align="center">
          नमस्ते, {userName}
        </Typography>
        <Typography variant="body2" align="center">
          आज आपकी फसल के लिए मौसम अच्छा है
        </Typography>
      </Box>

      {/* Main Menu */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
        <MenuButton color="info">
          <IconWrapper color="info">
            <SchoolIcon />
          </IconWrapper>
          <Typography variant="caption">ज्ञान केंद्र</Typography>
        </MenuButton>

        <MenuButton color="warning">
          <IconWrapper color="warning">
            <StoreIcon />
          </IconWrapper>
          <Typography variant="caption">बाज़ार</Typography>
        </MenuButton>

        <MenuButton color="secondary">
          <IconWrapper color="secondary">
            <AccountBalanceIcon />
          </IconWrapper>
          <Typography variant="caption">वित्त</Typography>
        </MenuButton>

        <MenuButton color="success">
          <IconWrapper color="success">
            <PeopleIcon />
          </IconWrapper>
          <Typography variant="caption">समुदाय</Typography>
        </MenuButton>
      </Box>

      {/* Voice Assistant Indicator */}
      <Box sx={{ 
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <IconButton
          sx={{ 
            bgcolor: '#e1f5fe',
            border: '1px solid #0288d1',
            '&:hover': { bgcolor: '#e1f5fe' }
          }}
        >
          <MicIcon sx={{ color: '#0288d1' }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default HomeScreen; 