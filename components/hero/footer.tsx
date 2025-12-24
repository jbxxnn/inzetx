// import Link from "next/link"
import Link from "next/link"
import BreathingText from "../fancy/text/breathing-text"

export default function Footer() {
  return (
    <footer className="w-full bg-secondary-foreground text-secondary border-t border-primary h-8 p-0 px-5 fixed bottom-0 left-0 right-0 z-50">
      <div className="flex flex-row gap-2 items-center justify-between p-0 pt-1">
        <div className="flex flex-row gap-4 items-center justify-between">
        <p className="text-xs text-secondary">More Inzet.X</p>
        <div className="h-4 w-px bg-primary" />
        <p className="text-xs text-secondary">English</p>
        <div className="h-4 w-px bg-primary" />
        <p className="text-xs text-primary">TOU</p>
        <p className="text-xs text-primary">Privacy</p>
        <p className="text-xs text-primary">Cookies</p>
        <p className="text-xs text-primary">Help</p>
        <p className="text-xs text-primary">Support</p>
        <p className="text-xs text-primary">Do not sell or share my personal information</p>
        </div>
        <div className="flex flex-row gap-2 items-center justify-between">
        <Link href={"/"} className="text-lg font-bold">
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
