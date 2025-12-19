import React from 'react';

export function InsightForgeLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
    >
      <g transform="scale(-1, 1) translate(-100, 0)">
        <path
          d="M20 80 L20 30 C20 20, 30 20, 30 20 L70 20 C80 20, 80 30, 80 30 L80 80"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M35 65 L50 50 L65 65"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5"
        />
        <path
          d="M50 50 L50 20"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5"
        />
      </g>
    </svg>
  );
}

export function ReelIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.5 7.5L12 9.5V14.5L16.5 16.5L21 14.5V9.5L16.5 7.5Z"
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 9.5L7.5 7.5L3 9.5V14.5L7.5 16.5L12 14.5V9.5Z"
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 14.5L7.5 16.5" stroke="white" strokeWidth="2" />
      <path d="M12 9.5L16.5 7.5" stroke="white" strokeWidth="2" />
    </svg>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}
