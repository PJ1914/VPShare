"use client"

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react"
import { AnimatePresence, motion } from "framer-motion"
import { GlowingEffect } from "@/components/ui/GlowingEffect";

const distributeItems = (allItems, columnCount) => {
    const columns = Array.from({ length: columnCount }, () => [])

    // Distribute items sequentially without shuffling
    allItems.forEach((item, index) => {
        columns[index % columnCount].push(item)
    })

    const maxLength = Math.max(...columns.map((col) => col.length))
    columns.forEach((col) => {
        while (col.length < maxLength) {
            // Fill with existing items if needed to balance columns
            col.push(allItems[Math.floor(Math.random() * allItems.length)])
        }
    })

    return columns
}

const InfoColumn = React.memo(
    ({ items, index, currentTime }) => {
        const cycleInterval = 3000 // Slower cycle for reading text
        const columnDelay = index * 200
        const adjustedTime = (currentTime + columnDelay) % (cycleInterval * items.length)
        const currentIndex = Math.floor(adjustedTime / cycleInterval)
        const currentItem = items[currentIndex]

        return (
            <motion.div
                className="relative h-64 w-full rounded-xl p-0.5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    delay: index * 0.1,
                    duration: 0.5,
                    ease: "easeOut",
                }}
            >
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                />
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={`${currentItem.title}-${currentIndex}`}
                            className="absolute inset-0 flex flex-col bg-white dark:bg-gray-900"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="h-32 overflow-hidden shrink-0">
                                <img
                                    src={currentItem.image}
                                    alt={currentItem.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-4 flex-1 flex flex-col justify-center">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-sm md:text-base line-clamp-1">{currentItem.title}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{currentItem.description}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        )
    }
)

export function LogoCarousel({ columnCount = 3, items }) {
    const [itemSets, setItemSets] = useState([])
    const [currentTime, setCurrentTime] = useState(0)

    const updateTime = useCallback(() => {
        setCurrentTime((prevTime) => prevTime + 100)
    }, [])

    useEffect(() => {
        const intervalId = setInterval(updateTime, 100)
        return () => clearInterval(intervalId)
    }, [updateTime])

    useEffect(() => {
        if (items) {
            const distributed = distributeItems(items, columnCount)
            setItemSets(distributed)
        }
    }, [items, columnCount])

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {itemSets.map((colItems, index) => (
                <InfoColumn
                    key={index}
                    items={colItems}
                    index={index}
                    currentTime={currentTime}
                />
            ))}
        </div>
    )
}
