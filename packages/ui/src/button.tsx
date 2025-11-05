'use client';

import { type ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  className?: string;
  appName: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const Button = ({ children, className, appName, onClick, disabled }: ButtonProps) => {
  const handleClick = onClick ?? (() => alert(`Hello from your ${appName} app!`));

  return (
    <button className={className} onClick={handleClick} disabled={disabled}>
      {children}
    </button>
  );
};
