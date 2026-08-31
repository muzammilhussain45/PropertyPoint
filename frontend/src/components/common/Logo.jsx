import React from 'react';
import { Link } from 'react-router-dom';
import { logoStyles as s } from '../../assets/dummyStyles.js';

const BrandMark = ({ size = 42 }) => (
  <svg
    viewBox="0 0 200 200"
    width={size}
    height={size}
    aria-label="Property Point logo"
    role="img"
    className="block"
  >
    <defs>
      <radialGradient id="brand-bg-grad" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#0d9488" />
        <stop offset="100%" stopColor="#044e46" />
      </radialGradient>
      <linearGradient id="brand-hill-back" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#10b981" />
      </linearGradient>
      <linearGradient id="brand-hill-front" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#059669" />
        <stop offset="100%" stopColor="#064e3b" />
      </linearGradient>
      <linearGradient id="brand-pin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>

    <circle cx="100" cy="100" r="100" fill="url(#brand-bg-grad)" />

    <path d="M58 84 L106 42 L154 84" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M132 55 V42 H148 V68" fill="#ffffff" />
    <path d="M142 80 V115 H70 V115" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />

    <rect x="95" y="78" width="10" height="10" rx="1.5" fill="#ffffff" />
    <rect x="108" y="78" width="10" height="10" rx="1.5" fill="#ffffff" />
    <rect x="95" y="91" width="10" height="10" rx="1.5" fill="#ffffff" />
    <rect x="108" y="91" width="10" height="10" rx="1.5" fill="#ffffff" />

    <path d="M26 138 C60 110 140 110 174 138 A100 100 0 0 1 174 138 C140 115 60 115 26 138 Z" fill="#6ee7b7" />
    <path d="M26 138 C60 114 140 114 174 138 A100 100 0 0 1 154 186 C110 140 50 150 26 138 Z" fill="url(#brand-hill-back)" />
    <path d="M26 138 C50 155 100 145 154 186 A100 100 0 0 1 46 186 C32 170 26 150 26 138 Z" fill="url(#brand-hill-front)" />

    <path d="M86 120 C96 116 114 122 105 130 C90 142 60 160 50 186 A100 100 0 0 0 92 196 C110 170 140 148 116 132 C108 126 98 122 86 120 Z" fill="#ffffff" />

    <g transform="translate(40, 82)">
      <path d="M22 0 C9.8 0 0 9.8 0 22 C0 37 22 56 22 56 C22 56 44 37 44 22 C44 9.8 34.2 0 22 0 Z" fill="url(#brand-pin-grad)" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />
      <circle cx="22" cy="21" r="10.5" fill="#0d9488" />
    </g>
  </svg>
);

const Logo = ({
  fontSize = '1.5rem',
  iconSize = 42,
  showText = true,
  ...props
}) => {
  return (
    <Link
      to="/"
      className={`${s.link} ${props.className || ''}`}
      style={{ fontSize, ...props.style }}
      {...props}
    >
      <div className={s.iconWrapper}>
        <BrandMark size={iconSize} />
      </div>
      {showText && <span className={s.text}>Property Point</span>}
    </Link>
  );
};

export default Logo;