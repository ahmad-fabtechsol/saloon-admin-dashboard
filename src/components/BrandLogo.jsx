import darkLogo from "@/assets/dark-logo.png"
import lightLogo from "@/assets/light-logo.png"
import { cn } from "@/lib/utils"

export default function BrandLogo({
  className,
  imageClassName = "h-10 w-10",
  inverted = false,
}) {
  const lightModeLogo = inverted ? darkLogo : lightLogo
  const darkModeLogo = inverted ? lightLogo : darkLogo

  return (
    <span className={cn("inline-flex items-center justify-center", className)}>
      <img
        src={lightModeLogo}
        alt="SalonPanda"
        className={cn("block object-contain dark:hidden", imageClassName)}
      />
      <img
        src={darkModeLogo}
        alt="SalonPanda"
        className={cn("hidden object-contain dark:block", imageClassName)}
      />
    </span>
  )
}
