import React from 'react';
import { motion } from 'framer-motion';
import {
    FileText, Sparkles, Download, LayoutTemplate,
    CheckCircle, ArrowRight, Wand2, Share2
} from 'lucide-react';
import Button from '../components/ui/Button';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className="bg-white dark:bg-prativeda-secondary-900 p-6 rounded-2xl border border-prativeda-secondary-100 dark:border-prativeda-secondary-800 hover:shadow-xl transition-all duration-300 group"
    >
        <div className="w-12 h-12 bg-prativeda-primary-50 dark:bg-prativeda-primary-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon className="w-6 h-6 text-prativeda-primary-600 dark:text-prativeda-primary-400" />
        </div>
        <h3 className="text-xl font-bold text-prativeda-secondary-900 dark:text-white mb-2">{title}</h3>
        <p className="text-prativeda-secondary-600 dark:text-prativeda-secondary-400 leading-relaxed">{description}</p>
    </motion.div>
);

const Prativeda = () => {
    return (
        <div className="min-h-screen bg-prativeda-secondary-50 dark:bg-prativeda-secondary-950 overflow-hidden">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-prativeda-primary-200/20 dark:bg-prativeda-primary-900/10 blur-3xl" />
                    <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-prativeda-secondary-200/20 dark:bg-prativeda-secondary-900/10 blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-prativeda-primary-100 dark:bg-prativeda-primary-900/30 text-prativeda-primary-700 dark:text-prativeda-primary-300 text-sm font-medium mb-6"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Introducing Prativeda</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-5xl md:text-7xl font-extrabold text-prativeda-secondary-900 dark:text-white tracking-tight mb-6"
                        >
                            Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-prativeda-primary-600 to-prativeda-primary-800 dark:from-prativeda-primary-400 dark:to-prativeda-primary-300">Dream Resume</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-xl text-prativeda-secondary-600 dark:text-prativeda-secondary-300 mb-10 leading-relaxed"
                        >
                            Create professional, ATS-friendly resumes in minutes with our AI-powered builder.
                            Stand out from the crowd and land your dream job.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <a
                                href="https://www.prativeda.codetapasya.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto"
                            >
                                <Button variant="prativeda" size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                                    Launch Prativeda
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </a>
                            <Button variant="prativeda-outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                                View Samples
                            </Button>
                        </motion.div>
                    </div>

                    {/* Mockup / Visual */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="relative mx-auto max-w-5xl"
                    >
                        <div className="bg-prativeda-secondary-900 rounded-2xl p-2 shadow-2xl border border-prativeda-secondary-800">
                            <div className="bg-prativeda-secondary-800 rounded-xl overflow-hidden aspect-[16/9] relative group">
                                {/* Placeholder for Resume Builder UI Screenshot */}
                                <div className="absolute inset-0 bg-gradient-to-br from-prativeda-secondary-800 to-prativeda-secondary-900 flex items-center justify-center">
                                    <div className="text-center">
                                        <LayoutTemplate className="w-20 h-20 text-prativeda-secondary-600 mx-auto mb-4" />
                                        <p className="text-prativeda-secondary-500 font-medium">Interactive Resume Builder Interface</p>
                                    </div>
                                </div>

                                {/* Floating Elements */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute top-10 right-10 bg-white dark:bg-prativeda-secondary-800 p-4 rounded-xl shadow-lg border border-prativeda-secondary-200 dark:border-prativeda-secondary-700 max-w-xs hidden md:block"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-prativeda-success-100 dark:bg-prativeda-success-900/30 flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 text-prativeda-success-600 dark:text-prativeda-success-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-prativeda-secondary-900 dark:text-white">ATS Score: 98/100</p>
                                            <p className="text-xs text-prativeda-secondary-500">Excellent optimization</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute bottom-10 left-10 bg-white dark:bg-prativeda-secondary-800 p-4 rounded-xl shadow-lg border border-prativeda-secondary-200 dark:border-prativeda-secondary-700 max-w-xs hidden md:block"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-prativeda-primary-100 dark:bg-prativeda-primary-900/30 flex items-center justify-center">
                                            <Wand2 className="w-5 h-5 text-prativeda-primary-600 dark:text-prativeda-primary-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-prativeda-secondary-900 dark:text-white">AI Suggestions</p>
                                            <p className="text-xs text-prativeda-secondary-500">Content improved instantly</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-white dark:bg-prativeda-secondary-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-prativeda-secondary-900 dark:text-white mb-4">
                            Why Choose Prativeda?
                        </h2>
                        <p className="text-xl text-prativeda-secondary-600 dark:text-prativeda-secondary-400 max-w-2xl mx-auto">
                            Everything you need to create a job-winning resume without the hassle.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Wand2}
                            title="AI-Powered Writing"
                            description="Stuck on what to write? Our AI generates professional summaries and bullet points tailored to your role."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={LayoutTemplate}
                            title="Premium Templates"
                            description="Choose from a collection of modern, professional templates designed by HR experts."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={CheckCircle}
                            title="ATS Friendly"
                            description="Ensure your resume gets past Applicant Tracking Systems with our optimized layouts and formatting."
                            delay={0.3}
                        />
                        <FeatureCard
                            icon={FileText}
                            title="Real-time Preview"
                            description="See changes instantly as you edit. No more guessing how your final document will look."
                            delay={0.4}
                        />
                        <FeatureCard
                            icon={Download}
                            title="One-Click Export"
                            description="Download your resume in PDF or Word format instantly, ready for application."
                            delay={0.5}
                        />
                        <FeatureCard
                            icon={Share2}
                            title="Easy Sharing"
                            description="Get a unique link to your resume to share directly with recruiters or on social media."
                            delay={0.6}
                        />
                    </div>
                </div>
            </section>

            {/* ATS Score Checker Section */}
            <section className="py-24 bg-prativeda-secondary-50 dark:bg-prativeda-secondary-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-prativeda-success-100 dark:bg-prativeda-success-900/30 text-prativeda-success-700 dark:text-prativeda-success-300 text-sm font-medium mb-6">
                                <CheckCircle className="w-4 h-4" />
                                <span>Free Tool</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-prativeda-secondary-900 dark:text-white mb-6">
                                Check Your Resume's <span className="text-prativeda-primary-600 dark:text-prativeda-primary-400">ATS Score</span>
                            </h2>
                            <p className="text-lg text-prativeda-secondary-600 dark:text-prativeda-secondary-300 mb-8 leading-relaxed">
                                Is your resume getting rejected by robots? Use our free ATS checker to see how well your resume is optimized for Applicant Tracking Systems. Get a detailed score and actionable feedback.
                            </p>

                            <div className="space-y-4 mb-8">
                                {[
                                    "Instant score analysis (0-100)",
                                    "Keyword optimization suggestions",
                                    "Formatting and layout checks",
                                    "Role-specific matching"
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-prativeda-primary-100 dark:bg-prativeda-primary-900/30 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-4 h-4 text-prativeda-primary-600 dark:text-prativeda-primary-400" />
                                        </div>
                                        <span className="text-prativeda-secondary-700 dark:text-prativeda-secondary-300">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <a
                                href="https://www.prativeda.codetapasya.com/ats-checker"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="prativeda-outline" size="lg" className="text-lg px-8">
                                    Check My Score
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </a>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-prativeda-primary-600 to-prativeda-primary-800 rounded-2xl blur-2xl opacity-20 transform rotate-3"></div>
                            <div className="bg-white dark:bg-prativeda-secondary-900 border border-prativeda-secondary-200 dark:border-prativeda-secondary-800 rounded-2xl p-8 shadow-xl relative">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-lg font-semibold text-prativeda-secondary-900 dark:text-white">Resume Analysis</h3>
                                        <p className="text-sm text-prativeda-secondary-500">Last updated: Just now</p>
                                    </div>
                                    <div className="w-16 h-16 rounded-full border-4 border-prativeda-success-500 flex items-center justify-center">
                                        <span className="text-xl font-bold text-prativeda-success-600 dark:text-prativeda-success-400">92</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium text-prativeda-secondary-700 dark:text-prativeda-secondary-300">Keywords</span>
                                            <span className="text-prativeda-success-600 dark:text-prativeda-success-400">Excellent</span>
                                        </div>
                                        <div className="h-2 bg-prativeda-secondary-100 dark:bg-prativeda-secondary-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-prativeda-success-500 w-[95%]"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium text-prativeda-secondary-700 dark:text-prativeda-secondary-300">Formatting</span>
                                            <span className="text-prativeda-primary-600 dark:text-prativeda-primary-400">Good</span>
                                        </div>
                                        <div className="h-2 bg-prativeda-secondary-100 dark:bg-prativeda-secondary-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-prativeda-primary-500 w-[85%]"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium text-prativeda-secondary-700 dark:text-prativeda-secondary-300">Impact</span>
                                            <span className="text-prativeda-warning-600 dark:text-prativeda-warning-400">Needs Improvement</span>
                                        </div>
                                        <div className="h-2 bg-prativeda-secondary-100 dark:bg-prativeda-secondary-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-prativeda-warning-500 w-[65%]"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 p-4 bg-prativeda-primary-50 dark:bg-prativeda-primary-900/20 rounded-xl flex gap-3">
                                    <Sparkles className="w-5 h-5 text-prativeda-primary-600 dark:text-prativeda-primary-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-prativeda-primary-800 dark:text-prativeda-primary-200">
                                        <strong>AI Tip:</strong> Adding more quantifiable achievements to your work experience could boost your impact score by 15%.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto bg-gradient-to-br from-prativeda-primary-600 to-prativeda-primary-800 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative z-10"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Boost Your Career?</h2>
                        <p className="text-xl text-prativeda-primary-100 mb-10 max-w-2xl mx-auto">
                            Join thousands of job seekers who have successfully landed interviews with Prativeda.
                        </p>
                        <a
                            href="https://www.prativeda.codetapasya.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <button className="bg-white text-prativeda-primary-600 hover:bg-prativeda-primary-50 font-bold py-4 px-10 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg">
                                Create My Resume Now
                            </button>
                        </a>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Prativeda;
