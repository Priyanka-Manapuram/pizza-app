import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying");
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-pizza-light">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
        {status === "verifying" && <p>Verifying your email...</p>}
        {status === "success" && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-green-600">Email Verified!</h2>
            <p className="text-gray-600 mt-2">You can now log in to your account.</p>
            <Link to="/login" className="mt-4 inline-block bg-pizza-red text-white px-6 py-2 rounded-lg">
              Login
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-red-600">Verification Failed</h2>
            <p className="text-gray-600 mt-2">The link is invalid or has expired.</p>
            <Link to="/login" className="mt-4 inline-block text-pizza-red hover:underline">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}