import React from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'
// import Image from 'next/image'
// import ProgramSection from './program-section'

export const Hero = () => {
    return (
        <section className="relative flex flex-col gap-6 items-center text-center w-full mx-auto min-h-screen bg-secondary py-12 md:py-20 overflow-hidden">
            <div className="flex flex-col gap-6 items-center text-center w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">


                <div className="grid gap-8 md:gap-12 items-center w-full">
                    <div className="flex flex-col gap-6 w-full pt-16 items-center">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-secondary-foreground">
                            AI <span className="font-serif italic">connects</span> the right
                            <br />
                            help with you.
                        </h1>
                        <p className="mt-4 text-secondary-foreground text-sm md:text-base max-w-2xl">
                            Need something done around the house? Our AI instantly matches you with verified local freelancers. Or
                            turn your skills into income by helping neighbors in your free time.
                        </p>
                        <div className="flex flex-col md:flex-row gap-2 z-10">
                            <Button asChild className="w-full md:w-auto text-xs px-4 py-2 rounded-full bg-secondary-foreground text-secondary">
                                <Link href="/auth/sign-up">Find Help Now!</Link>
                            </Button>
                            <Button asChild className="w-full md:w-auto text-xs px-4 py-2 rounded-full bg-primary text-secondary-foreground border border-secondary">
                                <Link href="/learn-more">Start Earning Now!</Link>
                            </Button>
                        </div>
                    </div>


                    <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 w-full pt-16 z-10 no-scrollbar pb-8 md:overflow-x-visible md:snap-none md:flex-row md:justify-center md:pb-0">

                        <div
                            className="w-[85%] flex-shrink-0 snap-center h-[25rem] bg-[#785849] rounded-md bg-cover bg-top md:bg-center md:w-[20%] lg:w-[30%] md:flex-shrink"
                            style={{ backgroundImage: "url('/man-with-red-helmet-brick.png')" }}
                        ></div>
                        <div className="w-[85%] flex-shrink-0 snap-center h-[25rem] bg-[#fe9690] rounded-md bg-cover bg-top md:bg-center md:w-[20%] lg:w-[20%] md:flex-shrink"
                            style={{ backgroundImage: "url('/girl-yellow-jacket.png')" }}
                        ></div>
                        <div className="w-[85%] flex-shrink-0 snap-center h-[25rem] bg-[#ff8e32] rounded-md bg-cover bg-top md:bg-center md:w-[40%] lg:w-[40%] md:flex-shrink"
                            style={{ backgroundImage: "url('/carpenter-cutting-mdf-board-inside-workshop.png')" }}
                        ></div>
                        <div className="w-[85%] flex-shrink-0 snap-center h-[25rem] bg-[#ffc901] rounded-md bg-cover bg-top md:bg-center md:w-[20%] lg:w-[20%] md:flex-shrink"
                            style={{ backgroundImage: "url('/plumber-with-his-arms-crossed.png')" }}
                        ></div>
                        <div className="w-[85%] flex-shrink-0 snap-center h-[25rem] bg-[#0093fe] rounded-md bg-cover bg-top md:bg-center md:w-[30%] lg:w-[30%] md:flex-shrink"
                            style={{ backgroundImage: "url('/close-up-portrait-smiling-african-photographer-holding-photo-camera.png')" }}
                        ></div>
                    </div>

                    <h1 className="text-[12rem] md:text-[12rem] lg:text-[36rem] font-bold leading-tight bg-gradient-to-t from-white to-transparent bg-clip-text text-transparent opacity-[0.5] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 whitespace-nowrap pointer-events-none">INZET.X</h1>
                </div>




                <div>
                    {/* <ProgramSection /> */}
                </div>
                <div></div>
            </div>
        </section>
    )
}