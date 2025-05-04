import React from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';

const LanguageButton = styled(Button)(({ theme, selected }) => ({
  width: '160px',
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

const languages = [
  { code: 'hi', name: 'हिंदी', nativeName: 'हिंदी' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'gu', name: 'ગુજરાતી', nativeName: 'ગુજરાતી' },
  { code: 'mr', name: 'मराठी', nativeName: 'मराठी' },
  { code: 'bn', name: 'বাংলা', nativeName: 'বাংলা' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', nativeName: 'ਪੰਜਾਬੀ' },
];

const LanguageSelector = ({ selectedLanguage, onLanguageSelect }) => {
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
          Welcome Screen
        </Typography>
      </Box>

      <Box sx={{ 
        width: '120px', 
        height: '120px', 
        bgcolor: '#e6f7e6', 
        borderRadius: '60px',
        border: '2px solid #4caf50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mx: 'auto',
        mb: 2
      }}>
        <Typography variant="h5" fontWeight="bold" color="#4caf50">
          कृषिMind
        </Typography>
      </Box>

      <Typography variant="subtitle2" fontWeight="bold" align="center" gutterBottom>
        Choose Your Language
      </Typography>
      <Typography variant="subtitle2" fontWeight="bold" align="center" gutterBottom>
        अपनी भाषा चुनें
      </Typography>

      <List>
        {languages.map((lang) => (
          <ListItem key={lang.code} sx={{ justifyContent: 'center' }}>
            <LanguageButton
              selected={selectedLanguage === lang.code}
              onClick={() => onLanguageSelect(lang.code)}
            >
              <ListItemText primary={lang.nativeName} />
            </LanguageButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default LanguageSelector; 