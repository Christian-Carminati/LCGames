'use client';

import React, { useState } from 'react';
import { DonationModal } from './DonationModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
        <button 
          type="button"
          className={`nes-btn is-warning ${className}`}
          onClick={() => setIsModalOpen(true)}
        >
          <i className="nes-icon coin is-small"></i> {label}
        </button>

        <DonationModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            username={username}
        />
    </>
  );
}

