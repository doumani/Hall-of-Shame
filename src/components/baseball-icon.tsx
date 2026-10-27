export function BaseballIcon({
  filled = false,
  className,
}: {
  filled?: boolean
  className?: string
}) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle
        cx="16"
        cy="16"
        r="13.25"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M9.2 5.6c2.7 3.6 2.7 17.2 0 20.8M22.8 5.6c-2.7 3.6-2.7 17.2 0 20.8"
        fill="none"
        stroke={filled ? "#F5F0E6" : "currentColor"}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}
