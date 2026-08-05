'use client';

import React from 'react';
import { DONATIONS_ENABLED } from '@/lib/features';

interface DonateButtonProps {
  label?: string;
  className?: string;
}

export function DonateButton({
    label = "WORK IN PROGRESS",
    className = ""
}: DonateButtonProps) {
  if (!DONATIONS_ENABLED) return null;

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

