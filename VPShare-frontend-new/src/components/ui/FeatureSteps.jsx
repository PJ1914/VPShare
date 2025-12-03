import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

export function FeatureSteps({
    features,
    className,
    title = "How to get Started",
    autoPlayInterval = 3000,
    imageHeight = "h-[400px]",
    onStepChange,
}) {
    const [currentFeature, setCurrentFeature] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (onStepChange) {
            onStepChange(currentFeature);
        }
    }, [currentFeature, onStepChange]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (progress < 100) {
                setProgress((prev) => prev + 100 / (autoPlayInterval / 100));
            } else {
                setCurrentFeature((prev) => (prev + 1) % features.length);
                setProgress(0);
            }
        }, 100);

        return () => clearInterval(timer);
    }, [progress, features.length, autoPlayInterval]);

    return (
        <div className={cn("p-4 sm:p-6 md:p-8 lg:p-12", className)}>
            <div className="max-w-7xl mx-auto w-full">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 md:mb-10 text-center text-gray-900 dark:text-white">
                    {title}
                </h2>

                <div className="flex flex-col md:grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-10">
                    <div className="order-2 md:order-1 space-y-4 sm:space-y-6 md:space-y-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="flex items-start sm:items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 cursor-pointer"
                                initial={{ opacity: 0.5 }}
                                animate={{ opacity: index === currentFeature ? 1 : 0.5 }}
                                transition={{ duration: 0.5 }}
                                onClick={() => {
                                    setCurrentFeature(index);
                                    setProgress(0);
                                }}
                            >
                                <motion.div
                                    className={cn(
                                        "w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0",
                                        index === currentFeature
                                            ? "bg-blue-600 border-blue-600 text-white scale-110"
                                            : "bg-gray-200 dark:bg-gray-800 border-gray-400 dark:border-gray-700 text-gray-800 dark:text-gray-400",
                                    )}
                                >
                                    {index <= currentFeature ? (
                                        <span className="text-sm sm:text-base md:text-lg font-bold">✓</span>
                                    ) : (
                                        <span className="text-sm sm:text-base md:text-lg font-bold">{index + 1}</span>
                                    )}
                                </motion.div>

                                <div className="flex-1">
                                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 line-clamp-2">
                                        {feature.title || feature.step}
                                    </h3>
                                    <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-800 dark:text-gray-300 font-medium line-clamp-3 sm:line-clamp-none leading-relaxed">
                                        {feature.content}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div
                        className={cn(
                            "order-1 md:order-2 relative overflow-hidden rounded-lg",
                            imageHeight
                        )}
                    >
                        <AnimatePresence mode="wait">
                            {features.map(
                                (feature, index) =>
                                    index === currentFeature && (
                                        <motion.div
                                            key={index}
                                            className="absolute inset-0 rounded-lg overflow-hidden"
                                            initial={{ y: 100, opacity: 0, rotateX: -20 }}
                                            animate={{ y: 0, opacity: 1, rotateX: 0 }}
                                            exit={{ y: -100, opacity: 0, rotateX: 20 }}
                                            transition={{ duration: 0.5, ease: "easeInOut" }}
                                        >
                                            <img
                                                src={feature.image}
                                                alt={feature.step}
                                                className="w-full h-full object-cover transition-transform transform"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white/40 dark:from-black/60 to-transparent" />
                                        </motion.div>
                                    ),
                            )}
                        </AnimatePresence>

                        {/* Progress indicator */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                            {features.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentFeature(index);
                                        setProgress(0);
                                    }}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all duration-300",
                                        index === currentFeature
                                            ? "w-8 bg-blue-600"
                                            : "w-1.5 bg-gray-300 dark:bg-gray-600",
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
