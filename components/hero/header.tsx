import React, { Suspense } from 'react'
import { AuthButton } from '../auth-button'
import { EnvVarWarning } from '../env-var-warning'
import { hasEnvVars } from '@/lib/utils'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import BreathingText from '../fancy/text/breathing-text'

export const Header = ({ className }: { className?: string }) => {
  return (
    <nav className={cn("w-full flex flex-col justify-center", className)}>
      <div className="w-full h-9 flex items-center justify-center text-sm font-medium bg-accent-foreground text-secondary">
        <p className="block md:hidden text-center">🎉 New: AI Talent Matching is live</p>
        <p className="hidden md:block text-center">🎉 New: AI Talent Matching is live - find your perfect freelancer in minutes!</p>
      </div>
      <div className="w-full flex justify-between items-center p-3 px-5 text-sm backdrop-blur-sm bg-secondary/95">
        <div className="flex gap-5 items-center font-semibold text-secondary-foreground">
          <Link href={"/"} className="text-lg font-bold">
            <BreathingText
              staggerDuration={0.08}
              fromFontVariationSettings="'wght' 100, 'slnt' 0"
              toFontVariationSettings="'wght' 800, 'slnt' -10"
            >
              INZET.X 2
            </BreathingText>
          </Link>
        </div>
        {!hasEnvVars ? (
          <EnvVarWarning />
        ) : (
          <Suspense>
            <AuthButton />
          </Suspense>
        )}
      </div>
    </nav>
  )
}