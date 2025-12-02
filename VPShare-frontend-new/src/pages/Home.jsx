import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, BookOpen, Trophy, Users, Star, Zap, Shield, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

// Typing Animation Component
const TypingCode = () => {
    const [displayedCode, setDisplayedCode] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    const fullCode = `function calculateFactorial(n) {
  if (n === 0 || n === 1) {
    return 1;
  }
  return n * calculateFactorial(n - 1);
}

// Calculate factorial of 5
console.log(calculateFactorial(5)); // Output: 120`;

    useEffect(() => {
        if (currentIndex < fullCode.length) {
            const timeout = setTimeout(() => {
                setDisplayedCode(prev => prev + fullCode[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, 30); // Typing speed: 30ms per character

            return () => clearTimeout(timeout);
        } else {
            // Reset after completion
            const resetTimeout = setTimeout(() => {
                setDisplayedCode('');
                setCurrentIndex(0);
            }, 3000); // Wait 3 seconds before restarting

            return () => clearTimeout(resetTimeout);
        }
    }, [currentIndex, fullCode]);

    // Syntax highlighting helper
    const highlightCode = (code) => {
        const lines = code.split('\n');
        return lines.map((line, lineIndex) => {
            let highlightedLine = line;

            // Keywords
            highlightedLine = highlightedLine.replace(/(function|if|return|const|let|var)/g, '<span class="text-blue-400">$1</span>');

            // Function names
            highlightedLine = highlightedLine.replace(/(\w+)(?=\()/g, '<span class="text-yellow-300">$1</span>');

            // Numbers
            highlightedLine = highlightedLine.replace(/\b(\d+)\b/g, '<span class="text-orange-300">$1</span>');

            // Comments
            highlightedLine = highlightedLine.replace(/(\/\/.*$)/g, '<span class="text-green-400">$1</span>');

            // Strings
            highlightedLine = highlightedLine.replace(/(['"`])(.*?)\1/g, '<span class="text-green-300">$1$2$1</span>');

            return (
                <div key={lineIndex} dangerouslySetInnerHTML={{ __html: highlightedLine || '&nbsp;' }} />
            );
        });
    };

    return (
        <div className="p-6 font-mono text-sm overflow-x-auto text-gray-300 min-h-[200px]">
            {highlightCode(displayedCode)}
            <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1"></span>
        </div>
    );
};

const Home = () => {
    const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

    const heroSlides = [
        {
            title: "Master Coding with CodeTapasya",
            subtitle: "The ultimate platform to learn, practice, and compete. Join thousands of developers building their future today.",
            cta: "Explore Courses",
            link: "/courses",
            gradient: "from-blue-600 to-indigo-600"
        },
        {
            title: "Build Real-World Projects",
            subtitle: "Don't just watch tutorials. Build portfolio-ready projects and get code reviews from experts.",
            cta: "Start Building",
            link: "/projects",
            gradient: "from-purple-600 to-pink-600"
        },
        {
            title: "Compete in Hackathons",
            subtitle: "Test your skills in global hackathons. Win prizes, earn badges, and get recognized.",
            cta: "Join Hackathon",
            link: "/hackathon",
            gradient: "from-orange-500 to-red-600"
        }
    ];

    const features = [
        {
            icon: BookOpen,
            title: "Structured Learning",
            description: "Comprehensive courses designed by industry experts to guide you step-by-step.",
            color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20"
        },
        {
            icon: Code,
            title: "Interactive Playground",
            description: "Write, run, and debug code directly in your browser with our advanced editor.",
            color: "text-green-500 bg-green-50 dark:bg-green-900/20"
        },
        {
            icon: Trophy,
            title: "Hackathons & Challenges",
            description: "Compete with peers, solve real-world problems, and win exciting prizes.",
            color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20"
        },
        {
            icon: Users,
            title: "Community & Mentorship",
            description: "Join a vibrant community of learners and get guidance from experienced mentors.",
            color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20"
        }
    ];

    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Frontend Developer",
            content: "CodeTapasya changed my career trajectory. The structured courses and real-time feedback helped me land my dream job.",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
        },
        {
            name: "Michael Chen",
            role: "Full Stack Engineer",
            content: "The hackathons are intense and incredibly rewarding. I've learned more in a weekend here than months of self-study.",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
        },
        {
            name: "Priya Patel",
            role: "Student",
            content: "I love the interactive playground. Being able to code and see results instantly makes learning so much more engaging.",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"
        }
    ];

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

    return (
        <div className="overflow-hidden bg-white dark:bg-gray-950">
            {/* Hero Carousel Section */}
            <section className="relative bg-gray-900 text-white overflow-hidden">
                <div className="embla" ref={emblaRef}>
                    <div className="flex">
                        {heroSlides.map((slide, index) => (
                            <div key={index} className="flex-[0_0_100%] min-w-0 relative">
                                <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-90`} />
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center mix-blend-overlay opacity-20" />

                                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48 flex flex-col items-center text-center z-10">
                                    <motion.h1
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
                                    >
                                        {slide.title}
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                        className="text-xl md:text-2xl text-gray-100 max-w-3xl mb-10"
                                    >
                                        {slide.subtitle}
                                    </motion.p>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5, delay: 0.4 }}
                                    >
                                        <Link to={slide.link}>
                                            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 border-none text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
                                                {slide.cta}
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Platform Highlights Section */}
            <section className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {[
                            {
                                label: "Learn Anywhere",
                                description: "Browser-based coding environment",
                                icon: Globe
                            },
                            {
                                label: "Expert-Led Courses",
                                description: "Industry professionals teaching",
                                icon: Star
                            },
                            {
                                label: "Real-Time Feedback",
                                description: "Instant code execution & results",
                                icon: Zap
                            },
                            {
                                label: "Secure & Reliable",
                                description: "Your code, safely stored",
                                icon: Shield
                            }
                        ].map((highlight, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
                            >
                                <div className="flex flex-col items-center text-center space-y-3">
                                    <div className="p-3 bg-white/20 rounded-full">
                                        <highlight.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold">{highlight.label}</div>
                                        <div className="text-sm text-blue-100 mt-1">{highlight.description}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-gray-50 dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose CodeTapasya?</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            We provide everything you need to go from beginner to professional developer in one platform.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {features.map((feature, index) => (
                            <motion.div key={index} variants={fadeInUp}>
                                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-900 group">
                                    <CardContent className="pt-8 text-center">
                                        <div className={`inline-flex items-center justify-center p-4 rounded-2xl mb-6 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                                            <feature.icon className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Interactive Code Preview Section with Typing Animation */}
            <section className="py-24 bg-white dark:bg-gray-900 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 bg-gray-900 transform hover:scale-[1.02] transition-transform duration-500">
                                <div className="flex items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
                                    <div className="flex space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="ml-4 text-xs text-gray-400 font-mono">main.js</div>
                                </div>
                                <TypingCode />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Testimonials Carousel */}
            <section className="py-24 bg-gray-50 dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Loved by Developers</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">See what our community has to say about their learning journey.</p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {testimonials.map((testimonial, index) => (
                            <motion.div key={index} variants={fadeInUp}>
                                <Card className="border-none shadow-lg bg-white dark:bg-gray-900 hover:shadow-xl transition-shadow duration-300">
                                    <CardContent className="pt-8">
                                        <div className="flex items-center mb-6">
                                            <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white">{testimonial.name}</div>
                                                <div className="text-sm text-blue-600 dark:text-blue-400">{testimonial.role}</div>
                                            </div>
                                        </div>
                                        <div className="flex mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                                            ))}
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.content}"</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-blue-600 dark:bg-blue-700">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Start Your Coding Journey?</h2>
                    <p className="text-xl text-blue-100 mb-10">
                        Join CodeTapasya today and get access to premium courses, challenges, and a supportive community.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/signup">
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 border-none w-full sm:w-auto shadow-xl">
                                Get Started for Free
                            </Button>
                        </Link>
                        <Link to="/courses">
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700 w-full sm:w-auto">
                                View All Courses
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default Home;
