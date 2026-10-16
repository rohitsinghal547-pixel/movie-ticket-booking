import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import API_URL from "./api";

function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await register(name, email, password);
            navigate("/");
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main
            className="auth-page"
            style={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 20px",
              background: "#0b1120",
              color: "#f8fafc",
              fontFamily: "Arial, sans-serif",
            }}
        >
                <div
                  className="auth-card"
                  style={{
                    width: "100%",
                    maxWidth: "440px",
                    padding: "36px",
                    border: "1px solid #263449",
                    borderRadius: "16px",
                    background: "#111c2e",
                    color: "#f8fafc",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                  }}
                >                
                
                <h1>Create Account</h1>

                <p>Join MovieTime and start your cinema experience.</p>

                    <form
                      onSubmit={handleSubmit}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        marginTop: "28px",
                      }}
                    >                    
                    
                    <label htmlFor="name">Full Name</label>

                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #35445a",
                        borderRadius: "8px",
                        background: "#0b1120",
                        color: "#f8fafc",
                        fontSize: "15px",
                      }}
                    />

                    <label htmlFor="email">Email Address</label>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #35445a",
                        borderRadius: "8px",
                        background: "#0b1120",
                        color: "#f8fafc",
                        fontSize: "15px",
                      }}
/>

                    <label htmlFor="password">Password</label>

                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="password"
                      required
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #35445a",
                        borderRadius: "8px",
                        background: "#0b1120",
                        color: "#f8fafc",
                        fontSize: "15px",
                      }}
                    />

                    {error && (
                        <p className="auth-error" role="alert"> 
                            {error}
                        </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: "100%",
                        marginTop: "12px",
                        padding: "13px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#16a34a",
                        color: "#ffffff",
                        fontSize: "16px",
                        fontWeight: "700",
                        cursor: loading ? "not-allowed" : "pointer",
                      }}
                    >
                      {loading ? "Creating Account..." : "Register"}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{" "}
                    <Link to="/login">Log in</Link>
                </p>

                <Link to="/" className="auth-home-link">
                    Back to MovieTime
                </Link>
            </div>
        </main>
    );
}

export default RegisterPage;