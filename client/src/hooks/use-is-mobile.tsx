import * as React from "react"
import { MOBILE_CONFIG, MEDIA_QUERIES } from "../lib/mobile-config"

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(MEDIA_QUERIES.mobile)
    const onChange = () => {
      setIsMobile(window.innerWidth <= MOBILE_CONFIG.breakpoints.mobile)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth <= MOBILE_CONFIG.breakpoints.mobile)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
