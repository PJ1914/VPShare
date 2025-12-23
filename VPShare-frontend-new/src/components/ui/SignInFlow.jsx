"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useAuth } from "../../contexts/AuthContext";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getFriendlyErrorMessage } from "../../lib/auth-helpers";

// --- Helper for Error Messages ---




// --- Shader & Canvas Components ---

export const CanvasRevealEffect = ({
    animationSpeed = 10,
    opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
    colors = [[0, 255, 255]],
    containerClassName,
    dotSize,
    showGradient = true,
    reverse = false,
}) => {
    return (
        <div className={cn("h-full relative w-full", containerClassName)}>
            <div className="h-full w-full">
                <DotMatrix
                    colors={colors ?? [[0, 255, 255]]}
                    dotSize={dotSize ?? 3}
                    opacities={
                        opacities ?? [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1]
                    }
                    shader={`
            ${reverse ? 'u_reverse_active' : 'false'}_;
            animation_speed_factor_${animationSpeed.toFixed(1)}_;
          `}
                    center={["x", "y"]}
                />
            </div>
            {showGradient && (
                <div className="absolute inset-0 bg-gradient-to-t from-blue-50/50 dark:from-black to-transparent" />
            )}
        </div>
    );
};

const DotMatrix = ({
    colors = [[0, 0, 0]],
    opacities = [0.04, 0.04, 0.04, 0.04, 0.04, 0.08, 0.08, 0.08, 0.08, 0.14],
    totalSize = 20,
    dotSize = 2,
    shader = "",
    center = ["x", "y"],
}) => {
    const uniforms = React.useMemo(() => {
        let colorsArray = [
            colors[0],
            colors[0],
            colors[0],
            colors[0],
            colors[0],
            colors[0],
        ];
        if (colors.length === 2) {
            colorsArray = [
                colors[0],
                colors[0],
                colors[0],
                colors[1],
                colors[1],
                colors[1],
            ];
        } else if (colors.length === 3) {
            colorsArray = [
                colors[0],
                colors[0],
                colors[1],
                colors[1],
                colors[2],
                colors[2],
            ];
        }
        return {
            u_colors: {
                value: colorsArray.map((color) => [
                    color[0] / 255,
                    color[1] / 255,
                    color[2] / 255,
                ]),
                type: "uniform3fv",
            },
            u_opacities: {
                value: opacities,
                type: "uniform1fv",
            },
            u_total_size: {
                value: totalSize,
                type: "uniform1f",
            },
            u_dot_size: {
                value: dotSize,
                type: "uniform1f",
            },
            u_reverse: {
                value: shader.includes("u_reverse_active") ? 1 : 0,
                type: "uniform1i",
            },
        };
    }, [colors, opacities, totalSize, dotSize, shader]);

    return (
        <Shader
            source={`
        precision mediump float;
        in vec2 fragCoord;

        uniform float u_time;
        uniform float u_opacities[10];
        uniform vec3 u_colors[6];
        uniform float u_total_size;
        uniform float u_dot_size;
        uniform vec2 u_resolution;
        uniform int u_reverse;

        out vec4 fragColor;

        float PHI = 1.61803398874989484820459;
        float random(vec2 xy) {
            return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
        }
        float map(float value, float min1, float max1, float min2, float max2) {
            return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
        }

        void main() {
            vec2 st = fragCoord.xy;
            ${center.includes("x")
                    ? "st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));"
                    : ""
                }
            ${center.includes("y")
                    ? "st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));"
                    : ""
                }

            float opacity = step(0.0, st.x);
            opacity *= step(0.0, st.y);

            vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

            float frequency = 5.0;
            float show_offset = random(st2);
            float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
            opacity *= u_opacities[int(rand * 10.0)];
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

            vec3 color = u_colors[int(show_offset * 6.0)];

            float animation_speed_factor = 0.5;
            vec2 center_grid = u_resolution / 2.0 / u_total_size;
            float dist_from_center = distance(center_grid, st2);

            float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);

            float max_grid_dist = distance(center_grid, vec2(0.0, 0.0));
            float timing_offset_outro = (max_grid_dist - dist_from_center) * 0.02 + (random(st2 + 42.0) * 0.2);


            float current_timing_offset;
            if (u_reverse == 1) {
                current_timing_offset = timing_offset_outro;
                 opacity *= 1.0 - step(current_timing_offset, u_time * animation_speed_factor);
                 opacity *= clamp((step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
            } else {
                current_timing_offset = timing_offset_intro;
                 opacity *= step(current_timing_offset, u_time * animation_speed_factor);
                 opacity *= clamp((1.0 - step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
            }


            fragColor = vec4(color, opacity);
            fragColor.rgb *= fragColor.a;
        }`}
            uniforms={uniforms}
        />
    );
};

const ShaderMaterial = ({
    source,
    uniforms,
    // maxFps = 60, // maxFps is unused
}) => {
    const { size } = useThree();
    const ref = useRef(null);
    // let lastFrameTime = 0; // lastFrameTime is unused

    useFrame(({ clock }) => {
        if (!ref.current) return;
        const timestamp = clock.getElapsedTime();
        const material = ref.current.material;
        const timeLocation = material.uniforms.u_time;
        timeLocation.value = timestamp;
    });

    const getUniforms = React.useCallback(() => {
        const preparedUniforms = {};

        for (const uniformName in uniforms) {
            const uniform = uniforms[uniformName];

            switch (uniform.type) {
                case "uniform1f":
                    preparedUniforms[uniformName] = { value: uniform.value, type: "1f" };
                    break;
                case "uniform1i":
                    preparedUniforms[uniformName] = { value: uniform.value, type: "1i" };
                    break;
                case "uniform3f":
                    preparedUniforms[uniformName] = {
                        value: new THREE.Vector3().fromArray(uniform.value),
                        type: "3f",
                    };
                    break;
                case "uniform1fv":
                    preparedUniforms[uniformName] = { value: uniform.value, type: "1fv" };
                    break;
                case "uniform3fv":
                    preparedUniforms[uniformName] = {
                        value: uniform.value.map((v) =>
                            new THREE.Vector3().fromArray(v)
                        ),
                        type: "3fv",
                    };
                    break;
                case "uniform2f":
                    preparedUniforms[uniformName] = {
                        value: new THREE.Vector2().fromArray(uniform.value),
                        type: "2f",
                    };
                    break;
                default:
                    console.error(`Invalid uniform type for '${uniformName}'.`);
                    break;
            }
        }

        preparedUniforms["u_time"] = { value: 0, type: "1f" };
        preparedUniforms["u_resolution"] = {
            value: new THREE.Vector2(size.width * 2, size.height * 2),
        };
        return preparedUniforms;
    }, [size.width, size.height, uniforms]);

    const material = useMemo(() => {
        const materialObject = new THREE.ShaderMaterial({
            vertexShader: `
      precision mediump float;
      in vec2 coordinates;
      uniform vec2 u_resolution;
      out vec2 fragCoord;
      void main(){
        float x = position.x;
        float y = position.y;
        gl_Position = vec4(x, y, 0.0, 1.0);
        fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
        fragCoord.y = u_resolution.y - fragCoord.y;
      }
      `,
            fragmentShader: source,
            uniforms: getUniforms(),
            glslVersion: THREE.GLSL3,
            blending: THREE.CustomBlending,
            blendSrc: THREE.SrcAlphaFactor,
            blendDst: THREE.OneFactor,
        });

        return materialObject;
    }, [source, getUniforms]);

    return (
        <mesh ref={ref}>
            <planeGeometry args={[2, 2]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
};

const Shader = ({ source, uniforms, maxFps = 60 }) => {
    return (
        <Canvas className="absolute inset-0  h-full w-full">
            <ShaderMaterial source={source} uniforms={uniforms} maxFps={maxFps} />
        </Canvas>
    );
};

// --- SignInFlow Component (Main) ---

export const SignInFlow = ({ className }) => {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState("form"); // form | success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [loggedInName, setLoggedInName] = useState("");

    const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
    const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);

    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await login(identifier, password);
            // Capture name
            setLoggedInName(res.user?.displayName || identifier.split('@')[0] || "User");

            // Success animation trigger
            setReverseCanvasVisible(true);
            setTimeout(() => setInitialCanvasVisible(false), 50);
            setTimeout(() => setStep("success"), 1500);
        } catch (err) {
            setError(getFriendlyErrorMessage(err));
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const res = await loginWithGoogle();
            setLoggedInName(res.user?.displayName || "User");

            setReverseCanvasVisible(true);
            setTimeout(() => setInitialCanvasVisible(false), 50);
            setTimeout(() => setStep("success"), 1500);
        } catch (err) {
            setError(getFriendlyErrorMessage(err));
            setLoading(false);
        }
    };

    // On Success Step Effect: Navigate after delay
    useEffect(() => {
        if (step === "success") {
            const timeout = setTimeout(() => {
                navigate("/dashboard");
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [step, navigate]);

    return (
        <div className={cn("flex w-[100%] flex-col min-h-screen bg-blue-50 dark:bg-black relative transition-colors duration-300", className)}>
            <div className="absolute inset-0 z-0">
                {/* Initial canvas (forward animation) */}
                {initialCanvasVisible && (
                    <div className="absolute inset-0">
                        <CanvasRevealEffect
                            animationSpeed={3}
                            containerClassName="bg-blue-50/50 dark:bg-black"
                            // Light mode: Vibrant colors. Dark mode: White dots.
                            colors={[
                                [59, 130, 246], // Blue 500
                                [139, 92, 246], // Violet 500
                            ]}
                            dotSize={6}
                            reverse={false}
                            showGradient={true}
                        />
                    </div>
                )}

                {/* Reverse canvas (appears on success) */}
                {reverseCanvasVisible && (
                    <div className="absolute inset-0">
                        <CanvasRevealEffect
                            animationSpeed={4}
                            containerClassName="bg-blue-50/50 dark:bg-black"
                            colors={[
                                [59, 130, 246],
                                [139, 92, 246],
                            ]}
                            dotSize={6}
                            reverse={true}
                            showGradient={true}
                        />
                    </div>
                )}

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.7)_0%,_transparent_100%)] dark:bg-[radial-gradient(circle_at_center,_rgba(0,0,0,1)_0%,_transparent_100%)]" />
                <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-blue-50 to-transparent dark:from-black dark:to-transparent" />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 flex flex-col flex-1 items-center justify-center p-4">

                <div className="w-full max-w-sm">
                    <AnimatePresence mode="wait">
                        {step === "form" ? (
                            <motion.div
                                key="form-step"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="space-y-4 sm:space-y-6 text-center"
                            >
                                <div className="space-y-1">
                                    <h1 className="text-3xl sm:text-[2.5rem] font-bold leading-[1.1] tracking-tight text-gray-900 dark:text-white">Welcome Back</h1>
                                    <p className="text-base sm:text-[1.2rem] text-gray-500 dark:text-white/70 font-light">Sign in to your account</p>
                                </div>

                                <div className="space-y-3 sm:space-y-4">
                                    <button
                                        onClick={handleGoogleLogin}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 bg-white/70 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-full py-2.5 sm:py-3 px-4 transition-colors font-medium disabled:opacity-50 cursor-pointer shadow-sm text-sm sm:text-base"
                                    >
                                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
                                        <span>Continue with Google</span>
                                    </button>

                                    <div className="flex items-center gap-4">
                                        <div className="h-px bg-gray-300 dark:bg-white/10 flex-1" />
                                        <span className="text-gray-400 dark:text-white/40 text-xs sm:text-sm">or</span>
                                        <div className="h-px bg-gray-300 dark:bg-white/10 flex-1" />
                                    </div>

                                    {error && <p className="text-red-500 text-xs sm:text-sm">{error}</p>}

                                    <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                                        <div className="relative text-left space-y-2 sm:space-y-3">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Email or Username"
                                                    value={identifier}
                                                    onChange={(e) => setIdentifier(e.target.value)}
                                                    className="w-full bg-white/70 dark:bg-white/5 backdrop-blur-md text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl py-2.5 sm:py-3 px-4 focus:outline-none focus:border-blue-500 dark:focus:border-white/30 transition-all placeholder:text-gray-400 dark:placeholder:text-white/30 shadow-sm text-sm sm:text-base"
                                                    required
                                                />
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full bg-white/70 dark:bg-white/5 backdrop-blur-md text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl py-2.5 sm:py-3 px-4 focus:outline-none focus:border-blue-500 dark:focus:border-white/30 transition-all placeholder:text-gray-400 dark:placeholder:text-white/30 shadow-sm text-sm sm:text-base"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-3 text-gray-400 dark:text-white/50 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
                                                >
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-semibold rounded-full py-2.5 sm:py-3 px-4 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
                                        >
                                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Sign In"}
                                        </button>
                                    </form>
                                </div>

                                <p className="text-xs text-gray-500 dark:text-white/40 pt-2 sm:pt-4">
                                    Don't have an account? <Link to="/signup" className="underline text-gray-700 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">Sign up</Link>
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success-step"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                                className="space-y-6 text-center"
                            >
                                <div className="space-y-1">
                                    <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-gray-900 dark:text-white">You're in, {loggedInName}!</h1>
                                    <p className="text-[1.25rem] text-gray-500 dark:text-white/50 font-light">Redirecting to dashboard...</p>
                                </div>

                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                    className="py-10"
                                >
                                    <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-white/20 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
