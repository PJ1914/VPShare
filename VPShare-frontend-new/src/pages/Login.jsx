import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Github, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to login', err);
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            await loginWithGoogle();
            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to login with Google', err);
            setError(err.message || 'Google login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[100px] animate-pulse delay-1000" />
                <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] rounded-full bg-pink-500/20 blur-[80px] animate-bounce duration-[10s]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="z-10 w-full max-w-md px-4"
            >
                <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl ring-1 ring-gray-200 dark:ring-gray-800">
                    <CardHeader className="space-y-3 pb-6 text-center">
                        <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mb-2">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-10 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <Input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pl-10 pr-10 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <div className="flex justify-end">
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                >
                                    <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">{error}</p>
                                </motion.div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-11 text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300"
                                isLoading={loading}
                                variant="primary"
                            >
                                Sign In
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 font-medium">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => alert('Github login not implemented')}
                                className="h-11 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Github className="mr-2 h-4 w-4" />
                                Github
                            </Button>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={handleGoogleLogin}
                                className="h-11 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <svg
                                    className="mr-2 h-4 w-4"
                                    aria-hidden="true"
                                    focusable="false"
                                    data-prefix="fab"
                                    data-icon="google"
                                    role="img"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 488 512"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                                    />
                                </svg>
                                Google
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-center pb-8">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link
                                to="/signup"
                                className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 hover:underline underline-offset-4 transition-all"
                            >
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
};

export default Login;
