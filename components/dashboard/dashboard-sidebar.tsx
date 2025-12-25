"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Briefcase,
  Home,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  Star,
  Menu,
  X,
  Calendar,
  MailQuestion,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import BreathingText from "../fancy/text/breathing-text"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Footer from "../hero/footer"

interface DashboardSidebarProps {
  role: 'client' | 'freelancer'
  unreadCount?: number
  pendingInvitesCount?: number
  activePath?: string
  onMobileMenuClose?: () => void
}

export function DashboardSidebar({
  role,
  unreadCount = 0,
  pendingInvitesCount = 0,
  activePath,
  onMobileMenuClose,
}: DashboardSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const isActive = (path: string) => {
    if (activePath) return activePath === path
    return pathname === path || pathname?.startsWith(path + '/')
  }

  const NavItem = ({
    href,
    icon: Icon,
    label,
    badge,
    onClick
  }: {
    href?: string
    icon: React.ComponentType<{ size?: number; className?: string }>
    label: string
    badge?: number
    onClick?: () => void
  }) => {
    const active = href ? isActive(href) : false
    const className = `flex items-center rounded-full gap-3 px-5 py-3.5 transition-all duration-200 w-full ${active
      ? "bg-primary text-secondary-foreground shadow-lg scale-[1.02]"
      : "text-secondary hover:bg-secondary hover:text-secondary-foreground hover:scale-[1.01]"
      }`

    if (href) {
      return (
        <Link
          href={href}
          className={className}
          onClick={() => {
            onClick?.()
            onMobileMenuClose?.()
          }}
        >
          <Icon size={20} />
          <span className="font-medium text-base">{label}</span>
          {badge !== undefined && badge > 0 && (
            <Badge className="ml-auto bg-primary text-secondary-foreground rounded-full px-2 py-0.5 text-xs font-bold min-w-[20px] flex items-center justify-center">
              {badge}
            </Badge>
          )}
        </Link>
      )
    }

    return (
      <button
        onClick={() => {
          onClick?.()
          onMobileMenuClose?.()
        }}
        className={className}
      >
        <Icon size={20} />
        <span className="font-medium text-base">{label}</span>
        {badge !== undefined && badge > 0 && (
          <Badge className="ml-auto bg-primary text-secondary-foreground rounded-full px-2 py-0.5 text-xs font-bold min-w-[20px] flex items-center justify-center">
            {badge}
          </Badge>
        )}
      </button>
    )
  }

  return (
    <>
      <Link href="/" className="flex items-center gap-2 mb-10">
        <BreathingText
          staggerDuration={0.08}
          fromFontVariationSettings="'wght' 100, 'slnt' 0"
          toFontVariationSettings="'wght' 800, 'slnt' -10"
        >
          INZET.X
        </BreathingText>
      </Link>

      <nav className="flex flex-col gap-3 flex-1">
        {role === 'client' ? (
          <>
            <NavItem href="/dashboard" icon={Home} label="Overview" />
            <NavItem href="/chat/job" icon={Search} label="Find Help" />
            <NavItem href="/dashboard/jobs" icon={Briefcase} label="My Jobs" />
            <NavItem href="/dashboard/bookings" icon={Calendar} label="Bookings" />
            <NavItem href="/dashboard/saved-pros" icon={Star} label="Saved Pros" />
            <NavItem icon={MessageSquare} label="Messages" badge={unreadCount} />
            <NavItem icon={Settings} label="Settings" />
          </>
        ) : (
          <>
            <NavItem href="/dashboard" icon={Home} label="Overview" />
            <NavItem href="/dashboard/bookings" icon={Calendar} label="Bookings" />
            <NavItem href="/dashboard/invites" icon={MailQuestion} label="Invites" badge={pendingInvitesCount} />
            <NavItem href="/dashboard/freelancer/profile" icon={Briefcase} label="My Profile" />
            <NavItem href="/dashboard/messages" icon={MessageSquare} label="Messages" badge={unreadCount} />
            <NavItem href="/dashboard/settings" icon={Settings} label="Settings" />
          </>
        )}
      </nav>

      <div className="border-t border-gray-800/50 pt-6 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-5 py-3.5 text-secondary hover:text-secondary-foreground hover:bg-secondary rounded-full transition-all duration-200 w-full"
        >
          <LogOut size={20} />
          <span className="font-medium text-base">Log Out</span>
        </button>
      </div>
    </>
  )
}

interface DashboardLayoutProps {
  role: 'client' | 'freelancer'
  children: React.ReactNode
  unreadCount?: number
  pendingInvitesCount?: number
  activePath?: string
}

export function DashboardLayout({
  role,
  children,
  unreadCount = 0,
  pendingInvitesCount = 0,
  activePath,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="flex min-w-0">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 bg-secondary-foreground text-secondary min-h-screen max-h-screen p-6 sticky top-0 border-r border-primary/20 shrink-0">
          <DashboardSidebar
            role={role}
            unreadCount={unreadCount}
            pendingInvitesCount={pendingInvitesCount}
            activePath={activePath}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 min-w-0 max-w-full">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between mb-6 sticky top-0 bg-secondary z-50 py-4 px-4 sm:px-6 border-b border-primary -mx-4 sm:-mx-6 -mt-4 sm:-mt-6">
            <Link href="/" className="text-2xl font-bold flex items-center gap-2">
              <BreathingText
                staggerDuration={0.08}
                fromFontVariationSettings="'wght' 100, 'slnt' 0"
                toFontVariationSettings="'wght' 800, 'slnt' -10"
              >
                INZET.X
              </BreathingText>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full hover:bg-secondary-foreground/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} className="text-secondary-foreground" /> : <Menu size={24} className="text-secondary-foreground" />}
            </button>
          </div>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-secondary/95 backdrop-blur-sm">
              <div className="flex flex-col h-full bg-secondary-foreground border-r border-primary/20">
                <div className="flex items-center justify-between p-6 border-b border-primary/20">
                  <Link href="/" className="text-2xl font-bold flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <BreathingText
                      staggerDuration={0.08}
                      fromFontVariationSettings="'wght' 100, 'slnt' 0"
                      toFontVariationSettings="'wght' 800, 'slnt' -10"
                    >
                      INZET.X
                    </BreathingText>
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-secondary/10 transition-colors"
                    aria-label="Close menu"
                  >
                    <X size={24} className="text-secondary" />
                  </button>
                </div>
                <nav className="flex flex-col gap-3 flex-1 p-6 overflow-y-auto">
                  <DashboardSidebar
                    role={role}
                    unreadCount={unreadCount}
                    pendingInvitesCount={pendingInvitesCount}
                    activePath={activePath}
                    onMobileMenuClose={() => setMobileMenuOpen(false)}
                  />
                </nav>
              </div>
            </div>
          )}
          <div className="mb-16 lg:mb-0 md:mb-0">
            {children}
          </div>
          <Footer className="block md:hidden lg:hidden" />
        </main>
      </div>
    </div>
  )
}

