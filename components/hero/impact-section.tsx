import Image from "next/image";

export default function ImpactSection() {
    return (
      <section className="w-full py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <span className="text-xs text-gray-500 uppercase tracking-wider">◆ OUR IMPACT</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-12 max-w-2xl text-foreground">
            Connecting homeowners with skilled local help — making communities stronger.
          </h2>
  
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center md:text-left">
              <div className="text-3xl md:text-4xl font-bold text-lime">50K+</div>
              <p className="text-sm text-muted-foreground mt-1">Jobs completed</p>
            </div>
            <div className="text-center md:text-left">
              <div className="text-3xl md:text-4xl font-bold text-lime">12K+</div>
              <p className="text-sm text-muted-foreground mt-1">Active freelancers</p>
            </div>
            <div className="text-center md:text-left">
              <div className="text-3xl md:text-4xl font-bold text-lime">25K+</div>
              <p className="text-sm text-muted-foreground mt-1">Happy homeowners</p>
            </div>
            <div className="text-center md:text-left">
              <div className="text-3xl md:text-4xl font-bold text-lime">4.9</div>
              <p className="text-sm text-muted-foreground mt-1">Average rating</p>
            </div>
          </div>
  
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="aspect-square md:aspect-[4/3] rounded-lg overflow-hidden">
              <Image 
              src="/electrician-helping-homeowner-with-wiring-repair.jpg" 
              alt="Electrician at work" 
              width={1000}
              height={1000}
              className="w-full h-full object-cover"
              style={{ borderRadius: '0.3rem' }} 
              />
            </div>
            <div className="aspect-square md:aspect-[4/3] rounded-lg overflow-hidden">
              <Image 
              src="/happy-homeowner-with-painter-interior-design.jpg" 
              alt="Painter with client" 
              width={1000}
              height={1000}
              className="w-full h-full object-cover"
              style={{ borderRadius: '0.3rem' }} 
              />
            </div>
            <div className="aspect-square md:aspect-[4/3] rounded-lg overflow-hidden col-span-2 md:col-span-1">
              <Image 
                src="/gardener-and-homeowner-shaking-hands-satisfied.jpg"
                alt="Gardener with homeowner"
                width={1000}
                height={1000}
                className="w-full h-full object-cover"
                style={{ borderRadius: '0.3rem' }}
              />
            </div>
          </div>
        </div>
      </section>
    )
  }
  