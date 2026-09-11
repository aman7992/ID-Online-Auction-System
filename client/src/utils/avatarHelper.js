/**
 * Avatar helper utilities
 * Provides consistent default avatars and fallback handling
 */

export const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%2364748b'%3E%3Crect width='100' height='100' fill='%231e293b'/%3E%3Ccircle cx='50' cy='38' r='20' fill='%2394a3b8'/%3E%3Cpath d='M20 85 C 20 62, 35 58, 50 58 C 65 58, 80 62, 80 85 Z' fill='%2394a3b8'/%3E%3C/svg%3E";

export const getInitialsAvatar = (name) => {
  const cleanName = (name || 'User').trim();
  const initials = cleanName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'U';

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <defs>
      <linearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'>
        <stop offset='0%25' stop-color='%23f59e0b' />
        <stop offset='100%25' stop-color='%23d97706' />
      </linearGradient>
    </defs>
    <rect width='100' height='100' rx='50' fill='url(%23grad)'/>
    <text x='50' y='58' font-family='sans-serif' font-size='38' font-weight='bold' fill='%230f172a' text-anchor='middle' dominant-baseline='central'>${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const getAvatarUrl = (userOrImage, name) => {
  if (typeof userOrImage === 'object' && userOrImage !== null) {
    if (userOrImage.profileImage && userOrImage.profileImage.trim()) {
      return userOrImage.profileImage;
    }
    return getInitialsAvatar(userOrImage.name || name || 'User');
  }

  if (typeof userOrImage === 'string' && userOrImage.trim()) {
    return userOrImage;
  }

  return getInitialsAvatar(name || 'User');
};
