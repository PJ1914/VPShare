"use client";
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { ArrowRight, Sparkles } from "lucide-react";

export const ShaderBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let animationFrameId;
        let particles = [];
        let mouse = { x: null, y: null };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            const particleCount = Math.min(Math.floor(window.innerWidth * window.innerHeight / 10000), 150);

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1,
                    color: `rgba(${100 + Math.random() * 155}, ${100 + Math.random() * 155}, 255, ${0.3 + Math.random() * 0.5})`
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off edges
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                // Mouse interaction
                if (mouse.x != null) {
                    const dx = mouse.x - p.x;
                    const dy = mouse.y - p.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 200) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (200 - distance) / 200;
                        const directionX = forceDirectionX * force * 0.05;
                        const directionY = forceDirectionY * force * 0.05;
                        p.vx += directionX;
                        p.vy += directionY;
                    }
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                // Draw connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(100, 150, 255, ${0.15 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        const handleMouseMove = (event) => {
            mouse.x = event.x;
            mouse.y = event.y;
        };

        const handleMouseLeave = () => {
            mouse.x = null;
            mouse.y = null;
        };

        window.addEventListener("resize", resizeCanvas);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseout", handleMouseLeave);

        resizeCanvas();
        draw();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseout", handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

const NeuralNetworkHero = ({
    title,
    description,
    badgeText,
    badgeLabel,
    ctaButtons = [],
    microDetails = []
}) => {
    return (
        <div className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden bg-white dark:bg-[#030303]">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] via-transparent to-purple-500/[0.05] blur-3xl" />
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white dark:from-[#030303] to-transparent z-10" />
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white dark:from-[#030303] to-transparent z-10" />

            {/* Particle Network Effect */}
            <ShaderBackground />

            <div className="relative z-20 container mx-auto px-4 md:px-6 flex flex-col items-center text-center">
                {/* Badge */}
                {(badgeLabel || badgeText) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 mb-8"
                    >
                        {badgeLabel && (
                            <span className="px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
                                {badgeLabel}
                            </span>
                        )}
                        {badgeText && (
                            <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                {badgeText}
                            </span>
                        )}
                    </motion.div>
                )}

                {/* Title */}
                {title && (
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 max-w-4xl"
                    >
                        {title}
                    </motion.h1>
                )}

                {/* Description */}
                {description && (
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-10 leading-relaxed"
                    >
                        {description}
                    </motion.p>
                )}

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-wrap items-center justify-center gap-4 mb-16"
                >
                    {ctaButtons.map((btn, idx) => (
                        <Button
                            key={idx}
                            variant={btn.primary ? "primary" : "outline"}
                            size="lg"
                            className={cn(
                                "rounded-full px-8 h-12 text-base",
                                btn.primary ? "shadow-lg shadow-blue-500/25" : "bg-white/50 dark:bg-black/50 backdrop-blur-sm"
                            )}
                            onClick={() => window.location.href = btn.href}
                        >
                            {btn.text}
                            {btn.primary && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    ))}
                </motion.div>

                {/* Micro Details */}
                {microDetails.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-gray-200 dark:border-gray-800 w-full max-w-3xl"
                    >
                        {microDetails.map((detail, idx) => (
                            <div key={idx} className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                                <Sparkles className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">{detail}</span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default NeuralNetworkHero;
