import Image from "next/image"

export default function CTASection() {
    return (
      <section className="w-full bg-accent py-16 md:py-24">
        <div className="flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-2">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-6">
            Ready to get
            <br />
            things done?
          </h2>
          <p className="text-sm text-black/70 mb-8 max-w-md">
            Whether you need help around the house or want to earn extra income with your skills — Klusbaar makes it
            simple. Join thousands already using AI-powered matching.
          </p>
  
          <div className="flex flex-wrap gap-3 mb-8">
            <button className="bg-black text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-black/90 transition-colors">
              I need help at home
            </button>
            <button className="bg-transparent text-black text-sm font-medium px-5 py-2.5 rounded-full border border-black hover:bg-black/10 transition-colors">
              I want to earn money
            </button>
            <button className="bg-transparent text-black text-sm font-medium px-5 py-2.5 rounded-full border border-black hover:bg-black/10 transition-colors">
              See how AI works
            </button>
          </div>
  
          <div className="flex -space-x-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-black/20 border-2 border-accent overflow-hidden">
                <Image
                  src={`/happy-person-portrait-.jpg`}
                  alt="Community member"
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
  