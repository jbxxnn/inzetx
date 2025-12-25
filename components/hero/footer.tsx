// import Link from "next/link"
import Link from "next/link"
import BreathingText from "../fancy/text/breathing-text"
import { cn } from "@/lib/utils"

interface FooterProps {
  className?: string
}

export default function Footer({ className }: FooterProps = {}) {
  return (
    <footer className={cn(
      "w-full bg-secondary-foreground text-secondary border-t border-primary h-10 md:h-8 p-0 px-5 fixed bottom-0 left-0 right-0 z-50",
      className
    )}>
      <div className="flex flex-row gap-2 items-center justify-between h-full pt-1">
        <div className="flex flex-row gap-2 md:gap-4 items-center">
          <p className="text-[10px] md:text-xs text-secondary whitespace-nowrap">More Inzet.X</p>
          <div className="h-3 md:h-4 w-px bg-primary" />

          {/* Desktop links */}
          <div className="hidden md:flex flex-row gap-4 items-center">
            <p className="text-xs text-secondary">English</p>
            <div className="h-4 w-px bg-primary" />
            <p className="text-xs text-primary">TOU</p>
            <p className="text-xs text-primary">Privacy</p>
            <p className="text-xs text-primary">Cookies</p>
            <p className="text-xs text-primary">Help</p>
            <p className="text-xs text-primary">Support</p>
            <p className="text-xs text-primary whitespace-nowrap">Do not sell or share my personal information</p>
          </div>

          {/* Mobile links */}
          <div className="flex md:hidden flex-row gap-3 items-center">
            <p className="text-[10px] text-primary">Privacy</p>
            <p className="text-[10px] text-primary">TOU</p>
          </div>
        </div>
        <div className="flex flex-row items-center">
          <Link href={"/"} className="text-sm md:text-lg font-bold leading-none">
            <BreathingText
              staggerDuration={0.08}
              fromFontVariationSettings="'wght' 100, 'slnt' 0"
              toFontVariationSettings="'wght' 800, 'slnt' -10"
            >
              INZET.X
            </BreathingText>
          </Link>
        </div>
      </div>
    </footer>
  )
}
