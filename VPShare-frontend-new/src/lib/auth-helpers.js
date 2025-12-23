export const getFriendlyErrorMessage = (error) => {
    const msg = error.message || error.toString();
    if (msg.includes("auth/user-not-found") || msg.includes("auth/invalid-credential")) return "Invalid email or password.";
    if (msg.includes("auth/wrong-password")) return "Invalid email or password.";
    if (msg.includes("auth/email-already-in-use")) return "This email is already registered.";
    if (msg.includes("auth/weak-password")) return "Password should be at least 6 characters.";
    if (msg.includes("Username is already taken")) return "Username is already taken.";
    if (msg.includes("network-request-failed")) return "Network error. Check your connection.";

    // Clean up generic firebase errors
    return msg.replace("Firebase: ", "").replace("Error (auth/", "").replace(").", "");
};
