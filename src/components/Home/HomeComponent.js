import React from 'react';
import Link from 'next/link';
import { useVoiceService } from '../../hooks/useVoiceService';
import styles from '../../styles/Home.module.css';

const HomeComponent = () => {
  const { playVoice } = useVoiceService();

  const features = [
    {
      id: 'identify',
      label: 'Crop Identifier',
      icon: '/images/identify-icon.png',
      voiceKey: 'identify',
      href: '/identify'
    },
    {
      id: 'finance',
      label: 'Financial Tools',
      icon: '/images/finance-icon.png',
      voiceKey: 'finance',
      href: '/finance'
    },
    {
      id: 'community',
      label: 'Community',
      icon: '/images/community-icon.png',
      voiceKey: 'community',
      href: '/community'
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      icon: '/images/marketplace-icon.png',
      voiceKey: 'marketplace',
      href: '/sell'
    }
  ];

  const handleOptionHover = (voiceKey) => {
    playVoice(voiceKey);
  };

  return (
    <div className={styles.homeContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>KrushiMind</h1>
        <p className={styles.subtitle}>Farming help that works where you farm</p>
      </header>

      <main className={styles.mainMenu}>
        <div className={styles.menuGrid}>
          {features.map((option) => (
            <Link href={option.href} key={option.id}>
              <div 
                className={styles.menuItem}
                onMouseEnter={() => handleOptionHover(option.voiceKey)}
                onClick={() => playVoice(option.voiceKey)}
              >
                <img 
                  src={option.icon} 
                  alt={option.label} 
                  className={styles.menuIcon} 
                />
                <span className={styles.menuLabel}>{option.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <div className={styles.offlineStatus}>
        <div className={styles.offlineIndicator} id="offline-indicator"></div>
      </div>
    </div>
  );
};

export default HomeComponent;