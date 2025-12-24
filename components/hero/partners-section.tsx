const partners = [
    { name: "HomeDepot", logo: "HomeDepot" },
    { name: "IKEA", logo: "IKEA" },
    { name: "Bosch", logo: "Bosch" },
    { name: "Stanley", logo: "Stanley" },
    { name: "DeWalt", logo: "DeWalt" },
  ]
  
  export default function PartnersSection() {
    return (
      <section className="bg-primary w-full text-card-foreground py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <span className="text-xs text-gray-500 uppercase tracking-wider">◆ TRUSTED BY</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-12 max-w-2xl text-primary-foreground">
            Partnered with industry-leading brands to ensure quality service.
          </h2>
  
          <div className="overflow-hidden py-8">
            <div className="flex animate-marquee">
              {[...partners, ...partners, ...partners, ...partners].map((partner, index) => (
                <div key={index} className="flex-shrink-0 mx-8 px-4 py-2 rounded-full bg-zinc-800">
                  <span className="text-primary-foreground font-normal text-xs whitespace-nowrap">{partner.logo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }
  