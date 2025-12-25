"use client"

import { motion, useInView } from "motion/react"
import { ReactNode, useRef } from "react"

interface ScrollRevealProps {
    children: ReactNode
    direction?: "up" | "down" | "left" | "right"
    delay?: number
    duration?: number
    once?: boolean
    className?: string
}

export function ScrollReveal({
    children,
    direction = "up",
    delay = 0,
    duration = 0.8,
    once = true,
    className = "",
}: ScrollRevealProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once })

    const variants = {
        hidden: {
            opacity: 0,
            x: direction === "left" ? -50 : direction === "right" ? 50 : 0,
            y: direction === "up" ? 50 : direction === "down" ? -50 : 0,
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
        },
    }

    return (
        <motion.div
            ref={ref}
            variants={variants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{
                duration,
                delay,
                ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
