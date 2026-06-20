import { BadgeCheck } from 'lucide-react'

/** Instagram-style verified badge. */
export default function Verified({ size = 12 }: { size?: number }) {
  return (
    <BadgeCheck
      className="verified-badge"
      size={size}
      fill="#0095f6"
      color="#fff"
      aria-label="Verified"
    />
  )
}
