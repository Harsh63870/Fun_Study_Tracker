import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { login, register } from "../api/auth";
import { useAuthStore } from "../store/useAuthStore";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
    }
  }, []);

  const mutation = useMutation({
    mutationFn: () => (isRegister ? register(username, password) : login(username, password)),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      navigate("/");
    },
    onError: (err) => {
      setError(err.response?.data?.error || "Login failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    mutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface">
      <div ref={cardRef} className="w-full max-w-md rounded-2xl border border-border bg-elevated p-8">
        <h1 className="text-2xl font-bold tracking-tight">Study Tracker</h1>
        <p className="text-muted text-sm mt-1 mb-6">
          Track college &amp; extra courses with commands
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted block mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-accent"
              required
              minLength={3}
            />
          </div>
          <div>
            <label className="text-sm text-muted block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:border-accent"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-accent text-surface font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {mutation.isPending ? "..." : isRegister ? "Create Account" : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-4">
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-accent hover:underline"
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>

        {!isRegister && (
          <p className="text-center text-xs text-muted mt-3 font-mono">
            Demo: demo / demo123
          </p>
        )}
      </div>
    </div>
  );
}
