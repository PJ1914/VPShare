"use client";

import React from "react";
import { motion } from "motion/react";
import { Folder, Code, SparklesIcon, BookOpen, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/GlowingEffect";

const DatabaseWithRestApi = ({
    className,
    circleText,
    badgeTexts,
    buttonTexts,
    title,
    lightColor,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className={cn(
                "relative flex h-[350px] w-full max-w-[900px] flex-col items-center",
                className
            )}
        >
            {/* SVG Paths  */}
            <svg
                className="h-full sm:w-full text-gray-400 dark:text-gray-600"
                width="100%"
                height="100%"
                viewBox="0 0 200 100"
            >
                <g
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="0.6"
                    strokeDasharray="100 100"
                    pathLength="100"
                >
                    <path d="M 31 10 v 15 q 0 5 5 5 h 59 q 5 0 5 5 v 10" />
                    <path d="M 77 10 v 10 q 0 5 5 5 h 13 q 5 0 5 5 v 10" />
                    <path d="M 124 10 v 10 q 0 5 -5 5 h -14 q -5 0 -5 5 v 10" />
                    <path d="M 170 10 v 15 q 0 5 -5 5 h -60 q -5 0 -5 5 v 10" />
                    {/* Animation For Path Starting */}
                    <animate
                        attributeName="stroke-dashoffset"
                        from="100"
                        to="0"
                        dur="1s"
                        fill="freeze"
                        calcMode="spline"
                        keySplines="0.25,0.1,0.5,1"
                        keyTimes="0; 1"
                    />
                </g>
                {/* Blue Lights */}
                <g mask="url(#db-mask-1)">
                    <circle
                        className="database db-light-1"
                        cx="0"
                        cy="0"
                        r="12"
                        fill="url(#db-blue-grad)"
                    />
                </g>
                <g mask="url(#db-mask-2)">
                    <circle
                        className="database db-light-2"
                        cx="0"
                        cy="0"
                        r="12"
                        fill="url(#db-blue-grad)"
                    />
                </g>
                <g mask="url(#db-mask-3)">
                    <circle
                        className="database db-light-3"
                        cx="0"
                        cy="0"
                        r="12"
                        fill="url(#db-blue-grad)"
                    />
                </g>
                <g mask="url(#db-mask-4)">
                    <circle
                        className="database db-light-4"
                        cx="0"
                        cy="0"
                        r="12"
                        fill="url(#db-blue-grad)"
                    />
                </g>
                {/* Buttons */}
                <g stroke="currentColor" fill="none" strokeWidth="0.6">
                    {/* First Button - Courses */}
                    <g>
                        <rect
                            fill="#6366F1"
                            x="12"
                            y="3"
                            width="38"
                            height="12"
                            rx="6"
                        ></rect>
                        <DatabaseIcon x="16" y="7"></DatabaseIcon>
                        <text
                            x="27"
                            y="11.5"
                            fill="white"
                            stroke="none"
                            fontSize="5"
                            fontWeight="500"
                        >
                            {badgeTexts?.first || "GET"}
                        </text>
                    </g>
                    {/* Second Button - Playground */}
                    <g>
                        <rect
                            fill="#8B5CF6"
                            x="55"
                            y="3"
                            width="44"
                            height="12"
                            rx="6"
                        ></rect>
                        <DatabaseIcon x="59" y="7"></DatabaseIcon>
                        <text
                            x="70"
                            y="11.5"
                            fill="white"
                            stroke="none"
                            fontSize="5"
                            fontWeight="500"
                        >
                            {badgeTexts?.second || "POST"}
                        </text>
                    </g>
                    {/* Third Button - Hackathons */}
                    <g>
                        <rect
                            fill="#A855F7"
                            x="102"
                            y="3"
                            width="44"
                            height="12"
                            rx="6"
                        ></rect>
                        <DatabaseIcon x="106" y="7"></DatabaseIcon>
                        <text
                            x="117"
                            y="11.5"
                            fill="white"
                            stroke="none"
                            fontSize="5"
                            fontWeight="500"
                        >
                            {badgeTexts?.third || "PUT"}
                        </text>
                    </g>
                    {/* Fourth Button - Challenges */}
                    <g>
                        <rect
                            fill="#6366F1"
                            x="148"
                            y="3"
                            width="46"
                            height="12"
                            rx="6"
                        ></rect>
                        <DatabaseIcon x="152" y="7"></DatabaseIcon>
                        <text
                            x="163"
                            y="11.5"
                            fill="white"
                            stroke="none"
                            fontSize="5"
                            fontWeight="500"
                        >
                            {badgeTexts?.fourth || "DELETE"}
                        </text>
                    </g>
                </g>
                <defs>
                    {/* 1 -  user list */}
                    <mask id="db-mask-1">
                        <path
                            d="M 31 10 v 15 q 0 5 5 5 h 59 q 5 0 5 5 v 10"
                            strokeWidth="0.5"
                            stroke="white"
                        />
                    </mask>
                    {/* 2 - task list */}
                    <mask id="db-mask-2">
                        <path
                            d="M 77 10 v 10 q 0 5 5 5 h 13 q 5 0 5 5 v 10"
                            strokeWidth="0.5"
                            stroke="white"
                        />
                    </mask>
                    {/* 3 - backlogs */}
                    <mask id="db-mask-3">
                        <path
                            d="M 124 10 v 10 q 0 5 -5 5 h -14 q -5 0 -5 5 v 10"
                            strokeWidth="0.5"
                            stroke="white"
                        />
                    </mask>
                    {/* 4 - misc */}
                    <mask id="db-mask-4">
                        <path
                            d="M 170 10 v 15 q 0 5 -5 5 h -60 q -5 0 -5 5 v 10"
                            strokeWidth="0.5"
                            stroke="white"
                        />
                    </mask>
                    {/* Blue Grad */}
                    <radialGradient id="db-blue-grad" fx="1">
                        <stop offset="0%" stopColor={lightColor || "#00A6F5"} />
                        <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                </defs>
            </svg>
            {/* Main Box */}
            <div className="absolute bottom-10 flex w-full flex-col items-center">
                {/* bottom shadow */}
                <div className="absolute -bottom-4 h-[100px] w-[62%] rounded-lg bg-accent/30" />
                {/* box title */}
                <div className="absolute -top-3 z-20 flex items-center justify-center rounded-lg border border-purple-500/50 bg-white dark:bg-gray-950 px-1.5 py-0.5 sm:-top-4 sm:py-1 shadow-sm">
                    <SparklesIcon className="size-2.5 text-purple-500 dark:text-purple-400" />
                    <span className="ml-1.5 text-[9px] text-gray-700 dark:text-gray-200 font-medium">
                        {title ? title : "Data exchange using a customized REST API"}
                    </span>
                </div>
                {/* box outter circle */}
                <div className="absolute -bottom-8 z-30 grid h-[60px] w-[60px] place-items-center rounded-full border border-purple-500/50 bg-white dark:bg-gray-950 font-semibold text-xs text-gray-900 dark:text-white shadow-xl shadow-purple-500/20">
                    {circleText ? circleText : "Learner"}
                </div>

                {/* box content with GlowingEffect */}
                <div className="relative z-10 w-full rounded-xl p-0.5">
                    <GlowingEffect
                        spread={40}
                        glow={true}
                        disabled={false}
                        proximity={64}
                        inactiveZone={0.01}
                        borderWidth={3}
                    />
                    <div className="relative flex h-[150px] w-full items-center justify-center overflow-hidden rounded-lg bg-white/90 dark:bg-gray-950/80 backdrop-blur-md shadow-2xl border border-gray-200 dark:border-transparent">
                        {/* Badges */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            viewport={{ once: true }}
                            className="absolute bottom-8 left-12 z-10 h-7 rounded-full bg-purple-600 hover:bg-purple-700 px-3 text-xs border border-purple-400/50 hover:border-purple-300 flex items-center gap-2 text-white cursor-pointer transition-colors shadow-lg shadow-purple-500/20"
                        >
                            <Code className="size-4" />
                            <span>{buttonTexts?.first || "LegionDev"}</span>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            viewport={{ once: true }}
                            className="absolute right-16 z-10 hidden h-7 rounded-full bg-blue-600 hover:bg-blue-700 px-3 text-xs sm:flex border border-blue-400/50 hover:border-blue-300 items-center gap-2 text-white cursor-pointer transition-colors shadow-lg shadow-blue-500/20"
                        >
                            <Folder className="size-4" />
                            <span>{buttonTexts?.second || "v2_updates"}</span>
                        </motion.div>
                        {/* Circles */}
                        <motion.div
                            className="absolute -bottom-14 h-[100px] w-[100px] rounded-full border border-purple-500/30 bg-purple-500/5"
                            animate={{
                                scale: [0.98, 1.02, 0.98, 1, 1, 1, 1, 1, 1],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.div
                            className="absolute -bottom-20 h-[145px] w-[145px] rounded-full border border-purple-500/25 bg-purple-500/5"
                            animate={{
                                scale: [1, 1, 1, 0.98, 1.02, 0.98, 1, 1, 1],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.div
                            className="absolute -bottom-[100px] h-[190px] w-[190px] rounded-full border border-purple-500/20 bg-purple-500/5"
                            animate={{
                                scale: [1, 1, 1, 1, 1, 0.98, 1.02, 0.98, 1, 1],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.div
                            className="absolute -bottom-[120px] h-[235px] w-[235px] rounded-full border border-purple-500/15 bg-purple-500/5"
                            animate={{
                                scale: [1, 1, 1, 1, 1, 1, 0.98, 1.02, 0.98, 1],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DatabaseWithRestApi;

const DatabaseIcon = ({ x = "0", y = "0" }) => {
    return (
        <svg
            x={x}
            y={y}
            xmlns="http://www.w3.org/2000/svg"
            width="5"
            height="5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M3 5V19A9 3 0 0 0 21 19V5" />
            <path d="M3 12A9 3 0 0 0 21 12" />
        </svg>
    );
};
