export default function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-secondary-fixed ${className}`} />;
}
