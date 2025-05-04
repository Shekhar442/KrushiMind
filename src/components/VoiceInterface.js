import React, { useState } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';

const DialectButton = styled(Button)(({ theme, selected }) => ({
  width: '180px',
  height: '30px',
  margin: '5px 0',
  borderRadius: '5px',
  backgroundColor: selected ? '#e8f5e9' : '#ffffff',
  border: selected ? '1px solid #4caf50' : '1px solid #dddddd',
  color: '#333333',
  '&:hover': {
    backgroundColor: selected ? '#e8f5e9' : '#f5f5f5',
  },
}));

const dialects = [
  { code: 'hi-up-east', name: 'हिंदी (Eastern UP)' },
  { code: 'hi-up-west', name: 'हिंदी (Western UP)' },
  { code: 'hi-raj', name: 'हिंदी (Rajasthan)' },
];

const VoiceInterface = ({ onContinue }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedDialect, setSelectedDialect] = useState('hi-up-east');

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
          Voice Interface Setup
        </Typography>
      </Box>

      <Box sx={{ 
        width: '80px', 
        height: '80px', 
        bgcolor: '#e1f5fe', 
        borderRadius: '40px',
        border: '2px solid #0288d1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mx: 'auto',
        mb: 2
      }}>
        <MicIcon sx={{ fontSize: 40, color: '#0288d1' }} />
      </Box>

      <Typography variant="subtitle2" fontWeight="bold" align="center" gutterBottom>
        Enable Voice Assistant?
      </Typography>
      <Typography variant="caption" align="center" display="block" color="text.secondary" gutterBottom>
        Works offline in your language
      </Typography>

      <Button
        variant="contained"
        color={isEnabled ? "success" : "default"}
        onClick={() => setIsEnabled(!isEnabled)}
        sx={{ width: '100%', mb: 2 }}
      >
        {isEnabled ? 'Enabled' : 'Enable Voice Assistant'}
      </Button>

      <Typography variant="subtitle2" fontWeight="bold" align="center" gutterBottom>
        Select Your Dialect
      </Typography>

      <List>
        {dialects.map((dialect) => (
          <ListItem key={dialect.code} sx={{ justifyContent: 'center' }}>
            <DialectButton
              selected={selectedDialect === dialect.code}
              onClick={() => setSelectedDialect(dialect.code)}
            >
              <ListItemText primary={dialect.name} />
            </DialectButton>
          </ListItem>
        ))}
      </List>

      <Button
        variant="contained"
        color="success"
        onClick={onContinue}
        sx={{ 
          width: '140px', 
          height: '40px', 
          borderRadius: '20px',
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      >
        Continue
      </Button>
    </Box>
  );
};

export default VoiceInterface; 