"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "How does the AI matching work?",
    answer:
      "Our AI analyzes multiple factors to create perfect matches. For clients, it considers your job requirements, location, budget, and urgency. For freelancers, it looks at skills, experience, availability, ratings, and proximity. The result? Fast, accurate matches that work for everyone.",
  },
  {
    question: "How do I post a job as a homeowner?",
    answer:
      "Simply describe what you need done, set your budget and preferred timing, and our AI will instantly match you with the best-suited freelancers in your area. You can review their profiles, ratings, and past work before choosing who to hire.",
  },
  {
    question: "How do I get paid as a freelancer?",
    answer:
      "Payments are processed securely through our platform. Once a job is marked complete and the client confirms, payment is released to your account within 24 hours. We support bank transfers and major payment methods.",
  },
  {
    question: "Is there a fee for using Klusbaar?",
    answer:
      "For freelancers, we charge a 10% service fee on completed jobs. For clients, you pay the agreed price plus a small booking fee (typically 5%). There are no subscription fees or hidden charges for either side.",
  },
  {
    question: "How are freelancers vetted?",
    answer:
      "All freelancers undergo identity verification, background checks, and skill assessments before joining the platform. We continuously monitor ratings and reviews to ensure quality. Clients can always see a freelancer's full profile and reviews before hiring.",
  },
  {
    question: "What if I'm not satisfied with the work?",
    answer:
      "We have a satisfaction guarantee for clients. If you're not happy with the work, contact our support team within 48 hours. We'll work with both parties to resolve the issue or provide a refund where appropriate. Your payment is held securely until you confirm the job is complete.",
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="bg-background w-full py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <span className="text-xs text-gray-500 uppercase tracking-wider">◆ FAQ</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">Frequently Asked Questions</h2>

        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-border">
              <button
                className="w-full py-4 flex items-center justify-between text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium text-foreground text-sm md:text-base">{faq.question}</span>
                <ChevronDown
                  size={20}
                  className={`text-muted-foreground transition-transform ${openIndex === index ? "rotate-180" : ""}`}
                />
              </button>
              {openIndex === index && (
                <div className="pb-4">
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Need more help?</span>
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <span className="text-black text-lg">→</span>
          </div>
        </div>
      </div>
    </section>
  )
}
