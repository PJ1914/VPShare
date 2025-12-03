"use client";
import {
    useScroll,
    useTransform,
    motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { ShaderBackground } from "./neural-network-hero";

export const Timeline = ({ data }) => {
    const ref = useRef(null);
    const containerRef = useRef(null);
    const [height, setHeight] = useState(0);
    const [scrollOffset, setScrollOffset] = useState(0);

    useEffect(() => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            setHeight(rect.height);
        }
    }, [ref]);

    // Track scroll position for vertical shader movement
    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const isInView = rect.top < window.innerHeight && rect.bottom > 0;

                if (isInView) {
                    // Calculate scroll progress through the timeline section
                    const scrollProgress = -rect.top / (rect.height - window.innerHeight);
                    setScrollOffset(Math.max(0, Math.min(1, scrollProgress)));
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial call

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 10%", "end 50%"],
    });

    const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
    const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

    return (
        <div
            className="w-full bg-white dark:bg-transparent font-sans px-3 sm:px-4 md:px-6 lg:px-10 relative overflow-hidden z-0"
            ref={containerRef}
        >
            {/* Animated Shader Background */}
            <div className="absolute inset-0 w-full h-full opacity-0 dark:opacity-100 pointer-events-none">
                <ShaderBackground />
            </div>

            <div className="max-w-7xl mx-auto py-8 sm:py-12 md:py-16 lg:py-20 px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-2 sm:mb-3 md:mb-4 text-black dark:text-white max-w-4xl font-bold">
                    The CodeTapasya Journey
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm md:text-base max-w-sm leading-relaxed">
                    From learning to mastery.
                </p>
            </div>

            <div ref={ref} className="relative max-w-7xl mx-auto pb-10 sm:pb-14 md:pb-20">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className="flex justify-start pt-6 sm:pt-10 md:pt-20 lg:pt-40 gap-4 md:gap-10"
                    >
                        <div className="sticky flex flex-col md:flex-row z-40 items-center top-24 sm:top-32 md:top-40 self-start max-w-xs lg:max-w-sm md:w-full">
                            <div className="h-8 sm:h-9 md:h-10 absolute left-2 sm:left-2.5 md:left-3 w-8 sm:w-9 md:w-10 rounded-full bg-white dark:bg-black flex items-center justify-center">
                                <div className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 rounded-full bg-gray-400 dark:bg-neutral-800 border border-gray-500 dark:border-neutral-700 p-1.5 sm:p-1.5 md:p-2" />
                            </div>
                            <h3 className="hidden md:block text-xl md:pl-20 md:text-3xl lg:text-5xl font-bold text-gray-900 dark:text-neutral-500">
                                {item.title}
                            </h3>
                        </div>

                        <div className="relative pl-12 sm:pl-14 md:pl-4 pr-2 sm:pr-3 md:pr-4 w-full">
                            <h3 className="md:hidden block text-base sm:text-lg md:text-2xl mb-3 sm:mb-3.5 md:mb-4 text-left font-bold text-gray-900 dark:text-neutral-500">
                                {item.title}
                            </h3>
                            {item.content}{" "}
                        </div>
                    </div>
                ))}
                <div
                    style={{
                        height: height + "px",
                    }}
                    className="absolute left-6 sm:left-6.5 md:left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-gray-500 dark:via-neutral-700 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] "
                >
                    <motion.div
                        style={{
                            height: heightTransform,
                            opacity: opacityTransform,
                        }}
                        className="absolute inset-x-0 top-0  w-[2px] bg-gradient-to-t from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full"
                    />
                </div>
            </div>
        </div>
    );
};
