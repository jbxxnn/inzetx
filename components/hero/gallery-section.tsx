import Image from "next/image"


export default function GallerySection() {
    return (
      <section className="w-full bg-background py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <span className="text-xs text-gray-500 uppercase tracking-wider">◆ REAL WORK</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-12 max-w-2xl text-foreground">
            See the quality work our freelancers deliver to happy homeowners every day.
          </h2>
  
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="aspect-square rounded-lg overflow-hidden">
                <Image 
                src="/freshly-painted-living-room-home-improvement.jpg" 
                alt="Painted room" 
                width={100}
                height={100}
                className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square rounded-lg overflow-hidden">
                <Image 
                src="/clean-organized-kitchen-after-cleaning-service.jpg" 
                alt="Clean kitchen" 
                width={100}
                height={100}
                className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square rounded-lg overflow-hidden">
                <Image 
                src="/handyman-installing-shelf-home-improvement.jpg" 
                alt="Landscaped garden" 
                width={100}
                height={100}
                className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square rounded-lg overflow-hidden">
                <Image 
                src="/plumber-fixing-sink-professional-home-service.jpg" 
                alt="Plumber at work" 
                width={100}
                height={100}
                className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Every freelancer on Klusbaar is vetted and rated by real customers. Our AI ensures you get matched with
                the best person for your specific job.
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }
  