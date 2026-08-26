export function GeometricBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 grid-lines opacity-[0.45]" />

      <svg
        className="absolute inset-0 h-full w-full text-[var(--indigo)]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.14">
          <line x1="0" y1="8%" x2="100%" y2="8%" />
          <line x1="0" y1="22%" x2="78%" y2="22%" />
          <line x1="0" y1="38%" x2="100%" y2="38%" />
          <line x1="0" y1="52%" x2="65%" y2="52%" />
          <line x1="0" y1="68%" x2="100%" y2="68%" />
          <line x1="14%" y1="0" x2="14%" y2="100%" />
          <line x1="36%" y1="0" x2="36%" y2="100%" />
          <line x1="78%" y1="0" x2="78%" y2="100%" />
          <line x1="0" y1="30%" x2="42%" y2="100%" />
          <line x1="100%" y1="14%" x2="28%" y2="100%" />
        </g>

        <g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.1">
          <rect x="6%" y="5%" width="100" height="100" />
          <rect x="68%" y="8%" width="160" height="80" />
          <rect x="50%" y="58%" width="120" height="120" />
          <circle cx="86%" cy="36%" r="72" />
          <circle cx="10%" cy="32%" r="48" />
          <circle cx="44%" cy="78%" r="36" />
          <polygon points="0,0 100,0 50,87" transform="translate(880 420)" />
          <polygon points="0,0 70,0 35,61" transform="translate(120 520)" />
        </g>

        <g stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.08">
          <circle cx="20%" cy="14%" r="4" />
          <circle cx="92%" cy="20%" r="5" />
          <circle cx="66%" cy="44%" r="3" />
          <rect x="26%" y="54%" width="8" height="8" transform="rotate(45 220 440)" />
        </g>
      </svg>

      <div className="geo-shape geo-square geo-square-1" />
      <div className="geo-shape geo-square geo-square-2" />
      <div className="geo-shape geo-circle geo-circle-1" />
      <div className="geo-shape geo-circle geo-circle-2" />
      <div className="geo-shape geo-triangle geo-triangle-1" />
      <div className="geo-shape geo-diamond geo-diamond-1" />
      <div className="geo-line geo-line-1" />
      <div className="geo-line geo-line-2" />
      <div className="geo-ring geo-ring-1" />
    </div>
  );
}
