import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, BookOpen, Trophy, Users, Star, Zap, Shield, Globe, Bot, Video, Brain, Gamepad2, Github, MonitorPlay, MousePointer2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { LogoCarousel } from '../components/ui/LogoCarousel';
import { GradientHeading } from '../components/ui/GradientHeading';
import { FeatureSteps } from '../components/ui/FeatureSteps';
import { GlowingEffect } from "@/components/ui/GlowingEffect";
import { GridItem } from "@/components/ui/GridItem";
import HeroGeometric from "@/components/ui/HeroGeometric";
import { BackgroundPaths } from "@/components/ui/BackgroundPaths";
import { Timeline } from "@/components/ui/Timeline";
import { IconCloud } from "@/components/ui/interactive-icon-cloud";
import NeuralNetworkHero from "@/components/ui/neural-network-hero";
import DatabaseWithRestApi from "@/components/ui/database-with-rest-api";
import TypingCode from "@/components/ui/TypingCode";
import { heroSlides, features, featureHighlights } from "@/data/home";
import { cn } from "@/lib/utils";



const Home = () => {
    const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
    const [isExploding, setIsExploding] = useState(false);
    const [showCursor, setShowCursor] = useState(false);
    // const ctaCanvasRef = useShaderBackground(); // Removed as we use LogoCarousel now

    const handleTypingComplete = () => {
        setShowCursor(true);
        // Delay explosion to allow cursor animation to complete
        setTimeout(() => {
            setIsExploding(true);
            // Reset explosion after animation completes
            setTimeout(() => {
                setIsExploding(false);
                setShowCursor(false);
            }, 1500); // Match explosion duration
        }, 1500); // Adjust timing based on cursor animation duration
    };

    const handleRunClick = () => {
        if (!isExploding) {
            setIsExploding(true);
            setTimeout(() => {
                setIsExploding(false);
            }, 1500);
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const currentHighlights = featureHighlights[activeFeatureIndex] || featureHighlights[0];

    const timelineData = useMemo(() => [
        {
            title: "Phase 1: Personalized Foundation",
            content: (
                <div>
                    <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
                        Smart algorithm creates tailored curriculum through quizzes.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative h-full rounded-xl p-0.5">
                            <GlowingEffect
                                spread={40}
                                glow={true}
                                disabled={false}
                                proximity={64}
                                inactiveZone={0.01}
                                borderWidth={3}
                            />
                            <div className="relative flex flex-col gap-4 h-full rounded-xl bg-white dark:bg-gray-900 p-4 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                                <div className="w-fit rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                                    <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Personalized Learning</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Content adapts to your unique learning style and goals.</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative h-full rounded-xl p-0.5">
                            <GlowingEffect
                                spread={40}
                                glow={true}
                                disabled={false}
                                proximity={64}
                                inactiveZone={0.01}
                                borderWidth={3}
                            />
                            <div className="relative flex flex-col gap-4 h-full rounded-xl bg-white dark:bg-gray-900 p-4 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                                <div className="w-fit rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2">
                                    <Video className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">AI Video Generator</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Auto-generated video lessons based on course content.</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative h-full rounded-xl p-0.5 col-span-2">
                            <GlowingEffect
                                spread={40}
                                glow={true}
                                disabled={false}
                                proximity={64}
                                inactiveZone={0.01}
                                borderWidth={3}
                            />
                            <div className="relative flex items-center gap-4 h-full rounded-xl bg-white dark:bg-gray-900 p-4 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                                <div className="w-fit rounded-lg bg-red-100 dark:bg-red-900/30 p-2">
                                    <MonitorPlay className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Live Classes & Mentorship</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">1 Week Free Trial. Affordable pricing based on your assignment performance.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Phase 2: AI-Powered Application",
            content: (
                <div>
                    <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
                        Code with AI power and seamless integration.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative h-full rounded-xl p-0.5">
                            <GlowingEffect
                                spread={40}
                                glow={true}
                                disabled={false}
                                proximity={64}
                                inactiveZone={0.01}
                                borderWidth={3}
                            />
                            <div className="relative flex flex-col gap-4 h-full rounded-xl bg-white dark:bg-gray-900 p-4 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                                <div className="w-fit rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                                    <Bot className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">CodeTapasya AI</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Your personal AI assistant for real-time help.</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative h-full rounded-xl p-0.5">
                            <GlowingEffect
                                spread={40}
                                glow={true}
                                disabled={false}
                                proximity={64}
                                inactiveZone={0.01}
                                borderWidth={3}
                            />
                            <div className="relative flex flex-col gap-4 h-full rounded-xl bg-white dark:bg-gray-900 p-4 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                                <div className="w-fit rounded-lg bg-orange-100 dark:bg-orange-900/30 p-2">
                                    <Github className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">GitHub Integration</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">View repos and edit projects directly in browser.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Phase 3: Gamified Growth",
            content: (
                <div>
                    <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
                        Level up with gamified elements and challenges.
                    </p>
                    <div className="mb-8 space-y-4">
                        <div className="relative h-full rounded-xl p-0.5">
                            <GlowingEffect
                                spread={40}
                                glow={true}
                                disabled={false}
                                proximity={64}
                                inactiveZone={0.01}
                                borderWidth={3}
                            />
                            <div className="relative flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 shadow-sm">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                    <Gamepad2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Gamified Learning</span>
                            </div>
                        </div>
                        <div className="relative h-full rounded-xl p-0.5">
                            <GlowingEffect
                                spread={40}
                                glow={true}
                                disabled={false}
                                proximity={64}
                                inactiveZone={0.01}
                                borderWidth={3}
                            />
                            <div className="relative flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 shadow-sm">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                                    <Trophy className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Weekly Challenges</span>
                            </div>
                        </div>
                        <div className="relative h-full rounded-xl p-0.5">
                            <GlowingEffect
                                spread={40}
                                glow={true}
                                disabled={false}
                                proximity={64}
                                inactiveZone={0.01}
                                borderWidth={3}
                            />
                            <div className="relative flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 shadow-sm">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                    <Shield className="h-3 w-3 text-green-600 dark:text-green-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Portfolio Building</span>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Why Us?",
            content: (
                <div>
                    <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-4">
                        See how CodeTapasya compares to others.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative h-full rounded-xl p-0.5 opacity-75">
                            <div className="relative flex flex-col gap-4 h-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                                <h4 className="font-bold text-gray-500 mb-2">Others</h4>
                                <ul className="space-y-3 text-sm text-gray-500">
                                    <li className="flex items-center gap-2"><span className="text-red-500">✕</span> Passive Video Watching</li>
                                    <li className="flex items-center gap-2"><span className="text-red-500">✕</span> No Immediate Feedback</li>
                                    <li className="flex items-center gap-2"><span className="text-red-500">✕</span> Isolated Learning</li>
                                    <li className="flex items-center gap-2"><span className="text-red-500">✕</span> Generic Projects</li>
                                </ul>
                            </div>
                        </div>
                        <div className="relative h-full rounded-xl p-0.5">
                            <GlowingEffect
                                spread={40}
                                glow={true}
                                disabled={false}
                                proximity={64}
                                inactiveZone={0.01}
                                borderWidth={3}
                            />
                            <div className="relative flex flex-col gap-4 h-full rounded-xl bg-white dark:bg-gray-900 p-6 shadow-lg">
                                <div className="absolute top-0 right-0 bg-linear-to-r from-blue-600 to-purple-600 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold uppercase tracking-wider z-10 shadow-md">
                                    Winner
                                </div>
                                <h4 className="font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 mb-2">CodeTapasya</h4>
                                <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Interactive Coding Environment</li>
                                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> AI-Powered Real-time Feedback</li>
                                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Vibrant Community & Mentorship</li>
                                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Real-world Hackathons</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
    ], []);

    const featureStepsFeatures = useMemo(() => heroSlides.map((slide, index) => ({
        step: `Feature ${index + 1}`,
        title: slide.title,
        content: slide.subtitle,
        image: [
            'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2070&auto=format&fit=crop', // Professional resume/documents - Prativeda
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop', // Online learning/courses
            'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=2069&auto=format&fit=crop', // Code editor/playground
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop'  // Team hackathon
        ][index]
    })), []);


    return (
        <div className="overflow-hidden bg-white dark:bg-gray-950">
            {/* Feature Steps Section */}
            <HeroGeometric>
                <FeatureSteps
                    features={featureStepsFeatures}
                    title="Everything You Need to Succeed in Tech"
                    autoPlayInterval={5000}
                    imageHeight="h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px]"
                    className="py-8 sm:py-12 md:py-16 lg:py-20 bg-transparent"
                    onStepChange={setActiveFeatureIndex}
                />
            </HeroGeometric>

            {/* Dynamic Details Section (Replaces Trusted By) */}
            <BackgroundPaths className="min-h-[40vh] sm:min-h-[50vh] py-12 sm:py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 flex flex-col items-center space-y-4 sm:space-y-6 md:space-y-8 relative z-10">
                    <div className="text-center mb-4 sm:mb-6 md:mb-8">
                        <GradientHeading variant="secondary" size="sm" className="mb-1 sm:mb-2 text-sm sm:text-base">
                            {currentHighlights.subtitle}
                        </GradientHeading>
                        <GradientHeading size="lg" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                            {currentHighlights.title}
                        </GradientHeading>
                    </div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="w-full"
                    >
                        <LogoCarousel
                            items={currentHighlights.cards}
                            columnCount={3}
                        />
                    </motion.div>
                </div>

                {/* Why Choose CodeTapasya? Section */}
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10 mt-12 sm:mt-16 md:mt-20 lg:mt-24">
                    <div className="text-center mb-8 sm:mb-12 md:mb-16">
                        <GradientHeading size="lg" className="mb-2 sm:mb-3 md:mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                            Why Choose CodeTapasya?
                        </GradientHeading>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2 leading-relaxed">
                            Everything you need from beginner to professional developer.
                        </p>
                    </div>

                    <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-2 lg:gap-4">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            const area = index === 3 ? "md:col-span-6 xl:col-span-12" : "md:col-span-6 xl:col-span-4";
                            const colorClass = index === 0 ? "text-blue-600 dark:text-blue-400" :
                                index === 1 ? "text-green-600 dark:text-green-400" :
                                    index === 2 ? "text-purple-600 dark:text-purple-400" :
                                        "text-orange-600 dark:text-orange-400";

                            return (
                                <GridItem
                                    key={index}
                                    area={area}
                                    icon={<Icon className={`h-6 w-6 ${colorClass}`} />}
                                    title={feature.title}
                                    description={feature.description}
                                />
                            );
                        })}
                    </ul>
                </div>
            </BackgroundPaths>

            {/* Interactive Code Preview Section with Typing Animation */}
            <section className="py-24 bg-white dark:bg-gray-900 overflow-hidden relative">
                <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
                    {/* White Flash Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={isExploding ? {
                            opacity: [0, 1, 0.5, 0],
                            scale: [1, 1.5, 1, 1]
                        } : { opacity: 0 }}
                        transition={{
                            duration: 1.2,
                            times: [0, 0.2, 0.5, 1],
                            ease: "easeOut"
                        }}
                        className="absolute inset-0 bg-gradient-radial from-white via-blue-200 to-transparent"
                    />

                    {/* Shockwave Ring 1 */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={isExploding ? {
                            scale: [0, 3, 6],
                            opacity: [0, 0.8, 0]
                        } : { scale: 0, opacity: 0 }}
                        transition={{
                            duration: 1.5,
                            ease: [0.34, 1.56, 0.64, 1]
                        }}
                        className="absolute w-32 h-32 rounded-full border-4 border-blue-500"
                    />

                    {/* Shockwave Ring 2 */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={isExploding ? {
                            scale: [0, 2.5, 5],
                            opacity: [0, 0.6, 0]
                        } : { scale: 0, opacity: 0 }}
                        transition={{
                            duration: 1.5,
                            delay: 0.1,
                            ease: [0.34, 1.56, 0.64, 1]
                        }}
                        className="absolute w-32 h-32 rounded-full border-4 border-purple-500"
                    />

                    {/* Primary Icon Cloud - Explosive Outward */}
                    <motion.div
                        initial={{ scale: 1.2, opacity: 0.15, rotate: 0 }}
                        animate={isExploding ? {
                            scale: [1.2, 5, 25],
                            opacity: [0.15, 1, 0],
                            rotate: [0, 180, 360]
                        } : { scale: 1.2, opacity: 0.15, rotate: 0 }}
                        transition={{
                            duration: 1.5,
                            times: [0, 0.3, 1],
                            ease: [0.34, 1.56, 0.64, 1]
                        }}
                        className="w-full h-full flex items-center justify-center"
                    >
                        <IconCloud iconSlugs={[
                            "typescript", "javascript", "dart", "openjdk", "react", "flutter", "android",
                            "html5", "css3", "nodedotjs", "express", "nextdotjs", "prisma", "amazonwebservices",
                            "postgresql", "firebase", "nginx", "vercel", "testinglibrary", "jest",
                            "cypress", "docker", "git", "jira", "github", "gitlab", "visualstudio",
                            "androidstudio", "sonarqube", "figma"
                        ]} />
                    </motion.div>

                    {/* Secondary Icon Cloud - Counter Rotation */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
                        animate={isExploding ? {
                            scale: [0.8, 4, 20],
                            opacity: [0, 0.8, 0],
                            rotate: [0, -90, -180]
                        } : { scale: 0.8, opacity: 0, rotate: 0 }}
                        transition={{
                            duration: 1.5,
                            delay: 0.1,
                            times: [0, 0.3, 1],
                            ease: [0.34, 1.56, 0.64, 1]
                        }}
                        className="absolute w-full h-full flex items-center justify-center"
                    >
                        <IconCloud iconSlugs={[
                            "python", "rust", "kotlin", "swift", "go", "php", "ruby"
                        ]} />
                    </motion.div>

                    {/* Radial Burst Lines */}
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={isExploding ? {
                                scale: [0, 3, 6],
                                opacity: [0, 0.6, 0]
                            } : { scale: 0, opacity: 0 }}
                            transition={{
                                duration: 1.2,
                                delay: i * 0.03,
                                ease: "easeOut"
                            }}
                            style={{
                                position: 'absolute',
                                width: '2px',
                                height: '100px',
                                background: `linear-gradient(to bottom, ${i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#8b5cf6' : '#10b981'}, transparent)`,
                                transformOrigin: 'center',
                                transform: `rotate(${i * 30}deg)`
                            }}
                        />
                    ))}
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            className="lg:w-1/2"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                Learn by Doing with our <span className="text-blue-600">Interactive Editor</span>
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                                Forget static tutorials. Our built-in code editor lets you practice what you learn immediately.
                                Get instant feedback, run tests, and build projects without leaving your browser.
                            </p>
                            <ul className="space-y-4 mb-8">
                                {[
                                    "Real-time syntax highlighting",
                                    "Instant preview for web projects",
                                    "Integrated terminal and console",
                                    "Multi-language support (JS, Python, Java, etc.)"
                                ].map((item, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="flex items-center text-gray-700 dark:text-gray-300"
                                    >
                                        <div className="mr-3 p-1 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                            <Zap className="h-4 w-4" />
                                        </div>
                                        {item}
                                    </motion.li>
                                ))}
                            </ul>
                            <Link to="/playground">
                                <Button size="lg" className="shadow-lg hover:shadow-xl">
                                    Try Playground Now
                                </Button>
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="lg:w-1/2 w-full"
                        >
                            <div className="relative rounded-xl p-0.5">
                                <GlowingEffect
                                    spread={40}
                                    glow={true}
                                    disabled={false}
                                    proximity={64}
                                    inactiveZone={0.01}
                                    borderWidth={3}
                                />
                                <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transform hover:scale-[1.02] transition-transform duration-500">
                                    <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center">
                                            <div className="flex space-x-2 mr-4">
                                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">main.js</div>
                                        </div>
                                        <motion.div
                                            whileTap={{ scale: 0.9 }}
                                            animate={isExploding ? { scale: [1, 0.8, 1.2], color: "#ef4444" } : {}}
                                            onClick={handleRunClick}
                                            className="cursor-pointer"
                                        >
                                            <Play className="w-4 h-4 text-green-500 hover:text-green-400 transition-colors" />
                                        </motion.div>
                                    </div>
                                    <div className="relative">
                                        <TypingCode onComplete={handleTypingComplete} />
                                        <AnimatePresence>
                                            {showCursor && (
                                                <motion.div
                                                    initial={{ opacity: 0, bottom: "20px", left: "20px" }}
                                                    animate={{
                                                        opacity: 1,
                                                        top: "-36px",
                                                        left: "auto",
                                                        right: "10px",
                                                        bottom: "auto"
                                                    }}
                                                    transition={{
                                                        duration: 1.5,
                                                        ease: "easeInOut",
                                                        delay: 0.2
                                                    }}
                                                    className="absolute z-50 pointer-events-none"
                                                >
                                                    <MousePointer2 className="w-6 h-6 text-white drop-shadow-lg fill-black" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section >

            {/* Timeline Section with Animated Shader Background */}
            <Timeline data={timelineData} />

            {/* CTA Section with HeroGeometric */}
            <HeroGeometric className="min-h-0 py-12 sm:py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center mb-6 sm:mb-8 md:mb-12"
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4 lg:mb-6 px-2">
                            Ready to Start Your Coding Journey?
                        </h2>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 dark:text-blue-100 mb-4 max-w-3xl mx-auto px-3 sm:px-4 leading-relaxed">
                            Get access to premium courses, challenges, and community.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="flex justify-center items-center mb-6 sm:mb-8 md:mb-12"
                    >
                        <DatabaseWithRestApi
                            className="max-w-2xl w-full"
                            circleText="Learner"
                            badgeTexts={{
                                first: "Courses",
                                second: "Playground",
                                third: "Hackathons",
                                fourth: "Challenges"
                            }}
                            buttonTexts={{
                                first: "CodeTapasya",
                                second: "Learn & Grow"
                            }}
                            title="Interactive learning with real-time progress tracking"
                            lightColor="#8B5CF6"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="flex flex-row justify-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 px-2 sm:px-3 md:px-0"
                    >
                        <Link to="/signup" className="flex-1 sm:flex-initial">
                            <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-white dark:text-blue-600 dark:hover:bg-gray-100 border-none w-full shadow-xl text-xs sm:text-sm md:text-base lg:text-lg py-2 sm:py-2.5 md:py-3 lg:py-4 px-3 sm:px-4 md:px-6">
                                Get Started for Free
                            </Button>
                        </Link>
                        <Link to="/courses" className="flex-1 sm:flex-initial">
                            <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-white dark:text-white dark:hover:bg-blue-700 w-full text-xs sm:text-sm md:text-base lg:text-lg py-2 sm:py-2.5 md:py-3 lg:py-4 px-3 sm:px-4 md:px-6">
                                View All Courses
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </HeroGeometric>
        </div >
    );
};

export default Home;
