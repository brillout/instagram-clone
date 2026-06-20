import { BadgeCheck } from 'lucide-react'

/** Instagram-style verified badge. */
export default function Verified({ size = 12 }: { size?: number }) {
  return (
    <BadgeCheck
      className="verified-badge"
      size={size}
      fill="#ff6b4a"
      color="#fff"
      aria-label="Verified"
    />
  )
}
