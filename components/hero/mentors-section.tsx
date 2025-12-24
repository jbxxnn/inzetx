import Image from "next/image"

const topFreelancers = [
    { name: "Jan de Vries", role: "Electrician", rating: "4.9", image: "dutch male electrician professional headshot" },
    { name: "Maria van Dijk", role: "Cleaner", rating: "5.0", image: "dutch female cleaner professional headshot" },
    { name: "Peter Bakker", role: "Plumber", rating: "4.8", image: "dutch male plumber professional headshot" },
    { name: "Sophie Jansen", role: "Gardener", rating: "4.9", image: "dutch female gardener professional headshot" },
    { name: "Thomas Visser", role: "Handyman", rating: "4.7", image: "dutch male handyman professional headshot" },
  ]
  
  export default function MentorsSection() {
    return (
      <section className="bg-background py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-wider">◆ TOP RATED</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold max-w-2xl mx-auto text-foreground">
              Meet our highest-rated freelancers delivering exceptional service every day.
            </h2>
          </div>
  
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {topFreelancers.map((freelancer, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mx-auto mb-2">
                  <Image
                    src={`/freelancer-worker-face-1.jpg`}
                    alt={freelancer.name}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs flex items-center gap-1 justify-center">
                  <span className="text-accent">★</span> {freelancer.rating} · {freelancer.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
  