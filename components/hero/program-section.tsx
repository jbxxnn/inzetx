import { Sparkles, Clock, Shield, Wallet, Home, Star, Search, CreditCard } from "lucide-react"

const freelancerFeatures = [
  {
    icon: Sparkles,
    title: "AI Job Matching",
    description: "Our AI finds jobs that match your skills, location, and schedule automatically.",
  },
  {
    icon: Clock,
    title: "Flexible Hours",
    description: "Work when you want. Accept jobs that fit around your existing commitments.",
  },
  {
    icon: Shield,
    title: "Verified Clients",
    description: "All clients are verified. Work with confidence knowing you'll get paid.",
  },
  {
    icon: Wallet,
    title: "Fast Payments",
    description: "Get paid within 24 hours of job completion. No waiting around.",
  },
]

const clientFeatures = [
  {
    icon: Search,
    title: "Instant Matching",
    description: "Post a job and our AI finds the best-rated freelancer for your specific needs.",
  },
  {
    icon: Star,
    title: "Vetted Professionals",
    description: "Every freelancer is background-checked, verified, and reviewed by real customers.",
  },
  {
    icon: Home,
    title: "Home Services",
    description: "From repairs to cleaning to gardening - find skilled help for any home task.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Only pay when you're satisfied. Money is held safely until the job is done.",
  },
]

export default function ProgramSection() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="w-full">
        <div className="mb-16">
          <div className="mb-4 text-left">
            <span className="text-xs text-gray-500 uppercase tracking-wider text-left">◆ FOR HOMEOWNERS</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-12 max-w-md text-primary-foreground text-left">
            Get your home tasks done by trusted local professionals.
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {clientFeatures.map((feature, index) => (
              <div key={index} className="flex flex-col items-start justify-start bg-zinc-800 rounded-xl p-6 hover:bg-zinc-700 transition-colors">
                <div className="w-10 h-10 rounded-full bg-zinc-700 hover:bg-zinc-800 transition-colors flex items-center justify-center mb-4">
                  <feature.icon size={20} className="text-accent" />
                </div>
                <h3 className="font-semibold text-primary-foreground mb-2 text-left">{feature.title}</h3>
                <p className="text-xs text-primary-foreground text-left">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3">
            <span className="text-sm text-gray-400">Post your first job</span>
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <span className="text-primary text-lg">→</span>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4 text-left">
            <span className="text-xs text-gray-500 uppercase tracking-wider text-left">◆ FOR FREELANCERS</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-12 max-w-2xl text-primary-foreground text-left">
            Turn your free time into extra income with AI-powered job matching.
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {freelancerFeatures.map((feature, index) => (
              <div key={index} className="flex flex-col items-start justify-start bg-zinc-800 rounded-xl p-6 hover:bg-zinc-700 transition-colors">
                <div className="w-10 h-10 rounded-full bg-zinc-700 hover:bg-zinc-800 transition-colors flex items-center justify-center mb-4">
                  <feature.icon size={20} className="text-accent" />
                </div>
                <h3 className="font-semibold text-primary-foreground mb-2 text-left">{feature.title}</h3>
                <p className="text-xs text-primary-foreground text-left">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3">
            <span className="text-sm text-gray-400">Start earning today</span>
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <span className="text-primary text-lg">→</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
