
import { useState } from "react"

export function useMobileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const toggleMobileMenu = () => {
    setIsMenuOpen(prev => !prev)
  }
  
  return {
    isMenuOpen,
    toggleMobileMenu,
  }
}
