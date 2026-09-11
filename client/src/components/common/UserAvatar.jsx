import React, { useState } from 'react';
import { getAvatarUrl, getInitialsAvatar } from '../../utils/avatarHelper';

const SIZE_CLASSES = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-24 h-24',
};

const UserAvatar = ({
  user,
  src,
  name,
  size = 'md',
  className = '',
  alt = '',
}) => {
  const [hasError, setHasError] = useState(false);

  // Extract from user object if provided
  const avatarSrc = src || user?.profileImage || '';
  const displayName = name || user?.name || 'User';
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const finalClassName = className ? className : `${sizeClass} rounded-full object-cover border border-amber-500/30 flex-shrink-0`;

  const fallback = getInitialsAvatar(displayName);
  const imageSrc = !hasError && avatarSrc && avatarSrc.trim() ? avatarSrc : fallback;

  return (
    <img
      src={imageSrc}
      alt={alt || displayName}
      className={finalClassName}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};

export default UserAvatar;
