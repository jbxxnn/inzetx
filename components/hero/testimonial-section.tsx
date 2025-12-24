import Image from "next/image"

const testimonials = [
    {
      quote:
        "I was skeptical at first, but Klusbaar matched me with a fantastic electrician within minutes. The AI really understood what I needed. Job done perfectly and at a fair price!",
      author: "Emma de Groot",
      role: "Homeowner, Amsterdam",
    },
    {
      quote:
        "As a part-time plumber, Klusbaar has been a game-changer. I pick up jobs on my days off and earn an extra €800-1000 per month. The app makes everything so easy.",
      author: "Mark van der Berg",
      role: "Freelancer, Rotterdam",
    },
  ]
  
  export default function TestimonialsSection() {
    return (
      <section className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-muted rounded-xl p-6 md:p-8">
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden">
                    <Image
                      src={`/dutch-person-professional-headshot-.jpg`}
                      alt={testimonial.author}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
  