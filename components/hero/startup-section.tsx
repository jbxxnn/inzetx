import Image from "next/image";

const jobCategories = [
    {
      name: "Home Repairs",
      icon: "🔧",
      freelancers: "2.4K",
      description: "Plumbing, electrical, fixtures, and general repairs around the house.",
    },
    {
      name: "Cleaning Services",
      icon: "✨",
      freelancers: "3.1K",
      description: "Deep cleaning, regular maintenance, move-in/out cleaning services.",
    },
    {
      name: "Gardening & Landscaping",
      icon: "🌿",
      freelancers: "1.8K",
      description: "Lawn care, planting, tree trimming, and outdoor maintenance.",
    },
  ]
  
  export default function StartupsSection() {
    return (
      <section className="bg-background py-16 md:py-24 border-t border-border w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-4 text-sm font-medium text-muted-foreground">Active Freelancers</th>
                  <th className="text-left py-4 text-sm font-medium text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody>
                {jobCategories.map((category, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="py-6">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <span className="font-semibold text-foreground">{category.name}</span>
                      </div>
                    </td>
                    <td className="py-6">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-background overflow-hidden"
                            >
                              <Image
                                src={`/freelancer-worker-face-${i}.jpg`}
                                alt="Freelancer"
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                                style={{ borderRadius: '0.3rem' }}
                              />
                            </div>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">+{category.freelancers}</span>
                      </div>
                    </td>
                    <td className="py-6">
                      <p className="text-sm text-muted-foreground max-w-xs">{category.description}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    )
  }
  