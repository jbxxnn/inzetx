import React from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'
// import Image from 'next/image'
// import ProgramSection from './program-section'

export const Hero = () => {
  return (
      <section className="flex flex-col gap-6 items-center text-center w-full mx-auto min-h-screen bg-secondary py-12 md:py-20">
        <div className="flex flex-col gap-6 items-center text-center w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
       
       
       <div className="grid gap-8 md:gap-12 items-centerx w-full">
        <div className="flex flex-col gap-6 w-full pt-16 items-center">
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold leading-tight text-secondary-foreground">
                  AI <span className="font-serif italic">connects</span> the right
                  <br />
                  help with you.
            </h1>
            <p className="mt-4 text-secondary-foreground text-sm md:text-base max-w-2xl">
              Need something done around the house? Our AI instantly matches you with verified local freelancers. Or
              turn your skills into income by helping neighbors in your free time.
            </p>
            <div className="flex flex-col md:flex-row gap-2 z-10">
                <Button asChild className="w-full md:w-auto text-xs px-4 py-2 rounded-full bg-accent text-accent-foreground">
                    <Link href="/auth/sign-up">Find Help Now!</Link>
                </Button>
                <Button asChild className="w-full md:w-auto text-xs px-4 py-2 rounded-full bg-primary text-secondary-foreground border border-secondary">
                    <Link href="/learn-more">Start Earning Now!</Link>
                </Button>
            </div>
        </div>  


        <div className="flex gap-6 items-center text-center w-full pt-16 z-10">
            {/* <Image 
            src="/handyman-helping-homeowner-with-home-repair-friend.jpg" 
            alt="Hero Image" 
            width={500} 
            height={300} 
            className="rounded-lg h-[300px] w-full object-cover object-center" 
            style={{
                borderRadius: '10px',
            }}
            /> */}
            <div className="w-[30%] h-[25rem] bg-[#785849] rounded-md"></div>
            <div className="w-[20%] h-[25rem] bg-[#fe9690] rounded-md"></div>
            <div className="w-[40%] h-[25rem] bg-[#ff8e32] rounded-md"></div>
            <div className="w-[20%] h-[25rem] bg-[#ffc901] rounded-md"></div>
            <div className="w-[30%] h-[25rem] bg-[#0093fe] rounded-md"></div>
        </div>

        <h1 className="text-[24rem] font-bold leading-tight text-secondary-foreground opacity-[0.03] absolute top-3/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">INZET.X</h1>
       </div>




       <div>
        {/* <ProgramSection /> */}
       </div>
       <div></div>
      </div>
      </section>
  )
}