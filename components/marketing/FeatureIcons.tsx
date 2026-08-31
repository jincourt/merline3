type FeatureIconProps = {
  className?: string;
};

export function PublishFeatureIcon({ className }: FeatureIconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M14 16H2V14H14V16ZM2 14H0V10H2V14ZM16 14H14V10H16V14ZM10 4H14V6H12V8H10V10H6V8H4V6H2V4H6V0H10V4Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function AgentFeatureIcon({ className }: FeatureIconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 16H2V14H6V16ZM14 14V16H10V14H14ZM2 8H6V10H2V14H0V2H2V8ZM10 14H6V10H10V14ZM16 14H14V10H10V8H14V2H16V14ZM6 2H2V0H6V2ZM14 2H10V0H14V2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CommissionFeatureIcon({ className }: FeatureIconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g clipPath="url(#feature-commission-clip)">
        <path
          d="M10 16H6V14H10V16ZM6 14H2V12H6V14ZM14 14H10V12H14V14ZM2 12H0V10H2V12ZM16 12H14V10H16V12ZM10 2H14V4H16V6H14V8H10V10H6V8H2V6H0V4H2V2H6V0H10V2Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="feature-commission-clip">
          <rect width="16" height="16" fill="currentColor" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function MessageFeatureIcon({ className }: FeatureIconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16 14H0V2H16V14ZM12 6H10V8H6V6H4V8H6V10H10V8H12V6H14V4H12V6ZM2 6H4V4H2V6Z"
        fill="currentColor"
      />
    </svg>
  );
}
