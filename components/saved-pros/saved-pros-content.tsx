"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  StarCircleIcon, 
  Location04Icon, 
  User02Icon
} from "@hugeicons/core-free-icons"
import { DashboardLayout } from "../dashboard/dashboard-sidebar"
import { unsaveFreelancer } from "@/app/actions/saved-pros"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface SavedFreelancer {
  id: string;
  freelancerProfileId: string;
  fullName?: string;
  profilePhoto?: string;
  headline?: string;
  description?: string;
  skills?: string[];
  location?: {
    city?: string;
    postcode?: string;
  };
  savedAt: string;
}

interface SavedProsContentProps {
  savedFreelancers: SavedFreelancer[];
  role: string;
  clientProfileId: string;
}

export default function SavedProsContent({ savedFreelancers, role, clientProfileId }: SavedProsContentProps) {
  const router = useRouter()
  const [unsavingIds, setUnsavingIds] = useState<Set<string>>(new Set())

  const handleUnsave = async (freelancerProfileId: string, savedId: string) => {
    setUnsavingIds(prev => new Set([...prev, savedId]))
    try {
      await unsaveFreelancer(clientProfileId, freelancerProfileId)
      router.refresh()
    } catch (error) {
      console.error('Failed to unsave freelancer:', error)
    } finally {
      setUnsavingIds(prev => {
        const next = new Set(prev)
        next.delete(savedId)
        return next
      })
    }
  }

  return (
    <DashboardLayout role={role as 'client' | 'freelancer'} activePath="/dashboard/saved-pros">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 lg:mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold text-secondary-foreground mb-2 sm:mb-3">
            Saved Pros
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-secondary-foreground/70">
            Your bookmarked freelancers
          </p>
        </div>
      </div>

      {/* Saved Freelancers Grid */}
      {savedFreelancers.length === 0 ? (
        <Card className="bg-primary-foreground border-2 border-secondary/50 hover:border-primary/50 transition-all duration-300">
          <CardContent className="flex flex-col items-center justify-center gap-6 py-16 sm:py-20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary flex items-center justify-center">
              <HugeiconsIcon icon={StarCircleIcon} className="w-8 h-8 sm:w-10 sm:h-10 text-secondary-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-secondary-foreground mb-2">
                No saved pros yet
              </h3>
              <p className="text-sm sm:text-base text-secondary-foreground/70 mb-6 max-w-md mx-auto">
                Bookmark freelancers you like to easily find them later
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {savedFreelancers.map((freelancer) => {
            const isUnsaving = unsavingIds.has(freelancer.id)
            
            return (
              <Card
                key={freelancer.id}
                className="bg-primary-foreground border-2 border-secondary/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group"
              >
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-start gap-3 mb-3">
                    {freelancer.profilePhoto ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-primary">
                        <Image
                          src={freelancer.profilePhoto}
                          alt={freelancer.fullName || 'Freelancer'}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <HugeiconsIcon icon={User02Icon} className="w-6 h-6 text-secondary-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg sm:text-xl font-heading font-bold text-secondary-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                        {freelancer.fullName || 'Freelancer'}
                      </CardTitle>
                      {freelancer.headline && (
                        <p className="text-sm text-secondary-foreground/70 line-clamp-1">
                          {freelancer.headline}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {freelancer.description && (
                    <p className="text-sm sm:text-base text-secondary-foreground/80 line-clamp-3 leading-relaxed">
                      {freelancer.description}
                    </p>
                  )}

                  {/* Skills */}
                  {freelancer.skills && freelancer.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {freelancer.skills.slice(0, 3).map((skill, index) => (
                        <Badge
                          key={index}
                          className="bg-primary text-secondary-foreground rounded-full px-2 py-0.5 text-xs font-medium"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {freelancer.skills.length > 3 && (
                        <Badge className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                          +{freelancer.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Location */}
                  {freelancer.location && (
                    <div className="flex items-center gap-2 text-sm text-secondary-foreground/70">
                      <HugeiconsIcon icon={Location04Icon} className="w-4 h-4 text-primary shrink-0" />
                      <span>
                        {freelancer.location.city || 'Almere'}
                        {freelancer.location.postcode && `, ${freelancer.location.postcode}`}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 sm:gap-3 pt-2">
                    <Button
                      onClick={() => handleUnsave(freelancer.freelancerProfileId, freelancer.id)}
                      disabled={isUnsaving}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-2 border-secondary-foreground/20 text-secondary-foreground bg-transparent rounded-full hover:bg-secondary-foreground/10 hover:border-primary/30 h-9 sm:h-10 font-medium transition-all duration-300"
                    >
                      {isUnsaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Removing...
                        </>
                      ) : (
                        'Remove'
                      )}
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 bg-primary text-secondary-foreground hover:bg-primary/90 rounded-full h-9 sm:h-10 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Link href={`/dashboard/freelancer/profile/${freelancer.freelancerProfileId}`} className="flex items-center justify-center gap-1.5">
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}

