'use client';

import React from 'react';

interface DonateButtonProps {
  label?: string;
  className?: string;
}

export function DonateButton({
    label = "DONATE COFFEE",
    className = ""
}: DonateButtonProps) {
  return (
    <a
      href="https://lowcarb.itch.io/"
      target="_blank"
      rel="noopener noreferrer"
      type="button"
      className={`nes-btn is-warning ${className}`}
    >
      <i className="nes-icon coin is-small"></i> {label}
    </a>
  );
}

