/**
 * UserAvatar - Reusable avatar that shows profile image if available,
 * otherwise falls back to the user's first name initial.
 *
 * Props:
 *   user  - object with { fullName, profileImage }  (or just a name string via `name`)
 *   name  - fallback name string (used if user is not passed)
 *   image - fallback image URL (used if user is not passed)
 *   size  - tailwind size classes for width/height, e.g. "w-10 h-10"
 *   textSize - tailwind text size, e.g. "text-sm"
 *   rounded - tailwind rounded class, e.g. "rounded-xl" (default "rounded-xl")
 *   gradient - tailwind gradient classes for the fallback bg (default primary→purple)
 *   className - extra classes
 */
const UserAvatar = ({
  user,
  name,
  image,
  size = 'w-10 h-10',
  textSize = 'text-sm',
  rounded = 'rounded-xl',
  gradient = 'from-primary-400 to-primary-600',
  className = '',
}) => {
  const displayName = user?.fullName || name || '?';
  const displayImage = user?.profileImage || image || null;
  const initial = displayName.charAt(0).toUpperCase();

  if (displayImage) {
    return (
      <div
        className={`${size} ${rounded} overflow-hidden flex-shrink-0 bg-dark-700 ${className}`}
      >
        <img
          src={displayImage}
          alt={displayName}
          className="w-full h-full object-cover"
          onError={(e) => {
            // If the image fails to load, replace with the initial fallback
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<span class="w-full h-full flex items-center justify-center text-white font-bold ${textSize} bg-gradient-to-br ${gradient}">${initial}</span>`;
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${size} ${rounded} bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold ${textSize} flex-shrink-0 ${className}`}
    >
      {initial}
    </div>
  );
};

export default UserAvatar;
