import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineLibrary } from 'react-icons/hi';
import { logoStyles as s } from '../../assets/dummyStyles.js';

const Logo = ({
  fontSize = '1.5rem',
  iconSize = 24,
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
        <HiOutlineLibrary size={iconSize} />
      </div>
      {showText && <span className={s.text}>Property Point</span>}
    </Link>
  );
};

export default Logo;