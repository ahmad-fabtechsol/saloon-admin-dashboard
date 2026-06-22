import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Circular user avatar that renders `src` when available and falls back to
 * `fallback` (e.g. initials) when there's no image OR the image fails to load.
 *
 * Browsers can't render some formats (notably HEIC from iPhones); the onError
 * fallback keeps those from showing as a broken image.
 */
export default function UserAvatar({ src, fallback, className, imgClassName }) {
  const [errored, setErrored] = useState(false)

  // Reset the error flag whenever the source changes (e.g. after an upload).
  useEffect(() => setErrored(false), [src])

  if (!src || errored) return fallback

  return (
    <img
      src={src}
      alt="Profile"
      onError={() => setErrored(true)}
      className={cn("object-cover", className, imgClassName)}
    />
  )
}
