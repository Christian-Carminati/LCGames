import React from 'react';

interface DonateButtonProps {
  username?: string;
  label?: string;
  className?: string;
}

export function DonateButton({ 
    username = "lowcarb", // Defaulting to lowcarb based on itch profile, user can change
    label = "DONATE COFFEE", 
    className = "" 
}: DonateButtonProps) {
  return (
    <a 
      href={`https://ko-fi.com/${username}`} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`nes-btn is-warning ${className}`}
    >
      <i className="nes-icon coin is-small"></i> {label}
    </a>
  );
}
