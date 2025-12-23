import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ArrowRight } from "lucide-react"

// Default stock images if none provided
const STOCK_IMAGES = [
    "https://images.unsplash.com/photo-1607799275518-d58665d096c2?q=80&w=800&auto=format&fit=crop", // Coding
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop", // VS Code
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop", // Abstract Tech
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop", // Cyberpunk
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop", // Laptop
];

const positionStyles = [
    { scale: 1, y: 0, zIndex: 3, opacity: 1 },
    { scale: 0.95, y: -20, zIndex: 2, opacity: 0.5 },
    { scale: 0.9, y: -40, zIndex: 1, opacity: 0.3 },
]

const exitAnimation = {
    y: 100,
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 }
}

const enterAnimation = {
    y: -40,
    scale: 0.9,
    opacity: 0
}

function CardContent({ data, onAction }) {
    return (
        <div className="flex h-full w-full flex-col gap-4 bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="relative h-[200px] w-full overflow-hidden bg-gray-100 dark:bg-gray-800 group">
                <img
                    src={data.image || STOCK_IMAGES[data.id % STOCK_IMAGES.length]}
                    alt={data.title}
                    className="h-full w-full select-none object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-xs font-bold uppercase tracking-wider">{data.tag || 'Assignment'}</span>
                </div>
            </div>
            <div className="flex flex-col justify-between flex-1 px-5 pb-5 pt-1">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h3 className="truncate text-lg font-bold text-gray-900 dark:text-white leading-tight">
                        {data.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {data.description}
                    </p>
                </div>
                <div className="flex items-center justify-between mt-4 md:mt-0">
                    <div className="text-xs font-medium text-gray-400 dark:text-gray-500">
                        {data.footerText || "Due Soon"}
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAction && onAction(data);
                        }}
                        className="flex h-9 shrink-0 cursor-pointer select-none items-center gap-1.5 rounded-full bg-gray-900 dark:bg-white pl-4 pr-3 text-xs font-bold text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg shadow-gray-200 dark:shadow-none"
                    >
                        Start
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    )
}

function AnimatedCard({
    card,
    index,
    isAnimating,
    onAction
}) {
    const style = positionStyles[index] || positionStyles[2]
    // Used simplified logic for zIndex to avoid flashing
    const zIndex = 3 - index

    return (
        <motion.div
            key={card.uniqueId || card.id}
            initial={index === 2 ? enterAnimation : false}
            animate={{
                y: style.y,
                scale: style.scale,
                zIndex: zIndex,
                opacity: style.opacity
            }}
            exit={index === 0 && isAnimating ? exitAnimation : undefined}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
            }}
            className="absolute flex h-[360px] w-full max-w-[360px] sm:max-w-[420px] origin-bottom items-center justify-center will-change-transform"
            style={{
                left: '50%',
                x: '-50%',
                bottom: 0
            }}
        >
            <CardContent data={card} onAction={onAction} />
        </motion.div>
    )
}

export default function AnimatedCardStack({ items = [], onAction }) {
    // We need to manage a stack of cards. 
    // We'll keep the visible stack to 3 items + a buffer.
    const [cards, setCards] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Initialize cards
        if (items.length > 0) {
            // Create initial stack of 3 (or less)
            const initialStack = items.map((item, idx) => ({ ...item, uniqueId: `${item.id}-${idx}` })); // Ensure unique keys if IDs repeat (they shouldn't but safe)
            setCards(initialStack);
        }
    }, [items]);

    const handleNext = () => {
        if (cards.length <= 1) return; // Don't animate if only 1 card
        setIsAnimating(true);

        // Remove top card and move to bottom (cycle) or remove permanently?
        // The visual implies cycling or "next". Let's cycle for endless feeling or just remove if it's a "Done" stack.
        // The user example cycles: "setCards([...cards.slice(1), { id: nextId, contentType: nextContentType }])"

        // We will cycle the first element to the end
        setTimeout(() => {
            setCards(prev => {
                const [first, ...rest] = prev;
                // Generate a mew unique ID for the cycled card to force React to treat it as new for animation (enter) if needed/or just same key
                // Actually, if we re-use key, Framer Motion might animate position. 
                // Let's just move it to end.
                return [...rest, first];
            });
            setIsAnimating(false);
        }, 200); // Wait for exit animation to start
    };

    if (!items || items.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500">
                No items to display
            </div>
        )
    }

    // Display only top 3 cards from the state
    const visibleCards = cards.slice(0, 3);

    return (
        <div className="flex w-full flex-col items-center justify-center py-8">
            <div className="relative h-[400px] w-full px-4 flex justify-center items-end">
                <AnimatePresence mode="popLayout">
                    {visibleCards.map((card, index) => (
                        <AnimatedCard
                            key={card.uniqueId || card.id}
                            card={card}
                            index={index}
                            isAnimating={isAnimating}
                            onAction={onAction}
                        />
                    ))}
                </AnimatePresence>
            </div>

            <div className="relative z-10 flex w-full items-center justify-center py-6 gap-4">
                <button
                    onClick={handleNext}
                    disabled={isAnimating || cards.length <= 1}
                    className="flex h-10 px-6 cursor-pointer select-none items-center justify-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft"
                >
                    Next Assignment <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
