"use client";

import * as React from "react";
import { useState, useId, useEffect, useMemo } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";
import { Eye, EyeOff, CheckCircle2, Loader2, Github } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getFriendlyErrorMessage } from "../../lib/auth-helpers";

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// --- Helper for Error Messages ---




export function Typewriter({
    text,
    speed = 100,
    cursor = "|",
    loop = false,
    deleteSpeed = 50,
    delay = 1500,
    className,
}) {
    const [displayText, setDisplayText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [textArrayIndex, setTextArrayIndex] = useState(0);

    const textArray = useMemo(() => Array.isArray(text) ? text : [text], [text]);
    const currentText = textArray[textArrayIndex] || "";

    useEffect(() => {
        if (!currentText) return;

        const timeout = setTimeout(
            () => {
                if (!isDeleting) {
                    if (currentIndex < currentText.length) {
                        setDisplayText((prev) => prev + currentText[currentIndex]);
                        setCurrentIndex((prev) => prev + 1);
                    } else if (loop) {
                        setTimeout(() => setIsDeleting(true), delay);
                    }
                } else {
                    if (displayText.length > 0) {
                        setDisplayText((prev) => prev.slice(0, -1));
                    } else {
                        setIsDeleting(false);
                        setCurrentIndex(0);
                        setTextArrayIndex((prev) => (prev + 1) % textArray.length);
                    }
                }
            },
            isDeleting ? deleteSpeed : speed,
        );

        return () => clearTimeout(timeout);
    }, [
        currentIndex,
        isDeleting,
        currentText,
        loop,
        speed,
        deleteSpeed,
        delay,
        displayText,
        textArray,
        textArrayIndex,
        textArray.length,
    ]);

    return (
        <span className={className}>
            {displayText}
            <span className="animate-pulse">{cursor}</span>
        </span>
    );
}

const labelVariants = cva(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef(({ className, ...props }, ref) => (
    <LabelPrimitive.Root
        ref={ref}
        className={cn(labelVariants(), className)}
        {...props}
    />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
    {
        variants: {
            variant: {
                default: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500",
                destructive: "bg-red-600 text-white hover:bg-red-700",
                outline: "border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
                secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
                ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
                link: "text-blue-600 underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-12 rounded-md px-6",
                icon: "h-8 w-8",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                "flex h-10 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-3 text-sm text-gray-900 dark:text-gray-100 shadow-sm shadow-black/5 transition-shadow placeholder:text-gray-500 focus-visible:bg-gray-50 dark:focus-visible:bg-gray-900 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            ref={ref}
            {...props}
        />
    );
});
Input.displayName = "Input";

const PasswordInput = React.forwardRef(({ className, label, ...props }, ref) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    return (
        <div className="grid w-full items-center gap-2">
            {label && <Label htmlFor={id}>{label}</Label>}
            <div className="relative">
                <Input id={id} type={showPassword ? "text" : "password"} className={cn("pe-10", className)} ref={ref} {...props} />
                <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer" aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? (<EyeOff className="size-4" aria-hidden="true" />) : (<Eye className="size-4" aria-hidden="true" />)}
                </button>
            </div>
        </div>
    );
});
PasswordInput.displayName = "PasswordInput";

function SignInForm() {
    // This component is mostly unused if specific routes are used for Login
    // But keeping logic consistent just in case
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [userName, setUserName] = useState("");

    const handleSignIn = async (event) => {
        event.preventDefault();
        setError("");
        setIsLoading(true);

        const formData = new FormData(event.target);
        const email = formData.get("email");
        const password = formData.get("password");

        try {
            const res = await login(email, password);
            setUserName(res.user?.displayName || "there");
            setSuccess(true);
            setTimeout(() => navigate("/dashboard"), 2000);
        } catch (err) {
            setError(getFriendlyErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-500 py-10">
                <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/20">
                    <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userName}!</h1>
                    <p className="text-gray-500 dark:text-gray-400">Taking you to your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-4 sm:gap-8">
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-xl sm:text-2xl font-bold">Sign in to your account</h1>
                <p className="text-balance text-sm text-gray-500">Enter your email below to sign in</p>
            </div>
            <div className="grid gap-4">
                <div className="grid gap-2"><Label htmlFor="email">Email or Username</Label><Input id="email" name="email" type="text" placeholder="m@example.com" required autoComplete="email" /></div>
                <PasswordInput name="password" label="Password" required autoComplete="current-password" placeholder="Password" />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" variant="default" className="mt-2 w-full" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In"}
                </Button>
            </div>
        </form>
    );
}

function SignUpForm() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [userName, setUserName] = useState("");

    const handleSignUp = async (event) => {
        event.preventDefault();
        setError("");
        setIsLoading(true);

        const formData = new FormData(event.target);
        const name = formData.get("name");
        const username = formData.get("username");
        const email = formData.get("email");
        const password = formData.get("password");

        try {
            const res = await signup(email, password, name, username);
            setUserName(name || res.user?.displayName || "there");
            setSuccess(true);
            setTimeout(() => navigate("/dashboard"), 2000);
        } catch (err) {
            setError(getFriendlyErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-500 py-10">
                <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/20">
                    <CheckCircle2 className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Welcome, {userName}!</h1>
                    <p className="text-gray-500 dark:text-gray-400">Your account has been created.</p>
                </div>
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-4 sm:gap-8">
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-xl sm:text-2xl font-bold">Create an account</h1>
                <p className="text-balance text-sm text-gray-500">Enter your details below to sign up</p>
            </div>
            <div className="grid gap-3 sm:gap-4">
                <div className="grid gap-1"><Label htmlFor="name">Full Name</Label><Input id="name" name="name" type="text" placeholder="John Doe" required autoComplete="name" /></div>
                <div className="grid gap-1"><Label htmlFor="username">Username</Label><Input id="username" name="username" type="text" placeholder="codewizard" required autoComplete="username" /></div>
                <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" /></div>
                <PasswordInput name="password" label="Password" required autoComplete="new-password" placeholder="Password" />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" variant="default" className="mt-2 w-full" disabled={isLoading}>
                    {isLoading ? "Signing Up..." : "Sign Up"}
                </Button>
            </div>
        </form>
    );
}

function AuthFormContainer({ isSignIn }) {
    const { loginWithGoogle, loginWithGithub } = useAuth();
    const navigate = useNavigate();

    const handleGoogle = async () => {
        try {
            await loginWithGoogle();
            navigate("/dashboard");
        } catch (error) {
            console.error("Google login failed", error);
        }
    };

    const handleGithub = async () => {
        try {
            await loginWithGithub();
            navigate("/dashboard");
        } catch (error) {
            const msg = getFriendlyErrorMessage(error);
            if (msg) alert(msg); // minimal error handling since this component lacks local error state for social auth
        }
    };

    return (
        <div className="mx-auto grid w-full max-w-[350px] gap-2">
            {isSignIn ? <SignInForm /> : <SignUpForm />}
            <div className="text-center text-sm">
                {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
                <Button variant="link" className="pl-1 text-gray-900 dark:text-gray-100 font-bold" onClick={() => navigate(isSignIn ? "/signup" : "/login")}>
                    {isSignIn ? "Sign up" : "Sign in"}
                </Button>
            </div>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-gray-200 dark:after:border-gray-800">
                <span className="relative z-10 bg-blue-50 dark:bg-gray-950 px-2 text-gray-500">Or continue with</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" type="button" onClick={handleGoogle} className="w-full">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google icon" className="mr-2 h-4 w-4" />
                    Google
                </Button>
                <Button variant="outline" type="button" onClick={handleGithub} className="w-full">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                </Button>
            </div>
        </div>
    )
}

const defaultSignInContent = {
    image: {
        src: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop",
        alt: "A beautiful interior design for sign-in"
    },
    quote: {
        text: "Welcome Back! The journey continues.",
        author: "CodeTapasya"
    }
};

const defaultSignUpContent = {
    image: {
        src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop",
        alt: "A vibrant, modern space for new beginnings"
    },
    quote: {
        text: "Create an account. A new chapter awaits.",
        author: "CodeTapasya"
    }
};

export function AuthUI({ signInContent = {}, signUpContent = {} }) {
    // Default to false because user said "use this for the signup only"
    const [isSignIn, setIsSignIn] = useState(false);
    const toggleForm = () => setIsSignIn((prev) => !prev);

    const finalSignInContent = {
        image: { ...defaultSignInContent.image, ...signInContent.image },
        quote: { ...defaultSignInContent.quote, ...signInContent.quote },
    };
    const finalSignUpContent = {
        image: { ...defaultSignUpContent.image, ...signUpContent.image },
        quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
    };

    const currentContent = isSignIn ? finalSignInContent : finalSignUpContent;

    return (
        <div className="w-full min-h-screen md:grid md:grid-cols-2">
            <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>
            <div className="flex min-h-[100dvh] items-center justify-center p-6 md:h-auto md:p-0 md:py-12 bg-blue-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
                <AuthFormContainer isSignIn={isSignIn} onToggle={toggleForm} />
            </div>

            <div
                className="hidden md:block relative bg-cover bg-center transition-all duration-500 ease-in-out"
                style={{ backgroundImage: `url(${currentContent.image.src})` }}
                key={currentContent.image.src}
            >

                <div className="absolute inset-x-0 bottom-0 h-[100px] bg-gradient-to-t from-gray-900/90 to-transparent" />

                <div className="relative z-10 flex h-full flex-col items-center justify-end p-2 pb-6">
                    <blockquote className="space-y-2 text-center text-white">
                        <p className="text-lg font-medium drop-shadow-md">
                            “<Typewriter
                                key={currentContent.quote.text}
                                text={currentContent.quote.text}
                                speed={60}
                                className="drop-shadow-md"
                            />”
                        </p>
                        <cite className="block text-sm font-light text-gray-200 not-italic drop-shadow-sm">
                            — {currentContent.quote.author}
                        </cite>
                    </blockquote>
                </div>
            </div>
        </div>
    );
}
