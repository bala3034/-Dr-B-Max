"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaUser, FaLock, FaArrowRight, FaFingerprint } from "react-icons/fa";
import { isWebAuthnSupported, registerBiometric, authenticateWithBiometric, hasBiometricRegistered } from "@/lib/webauthn";
import "@/lib/i18n";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setBiometricAvailable(isWebAuthnSupported());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  };

  const handleBiometric = async () => {
    setBiometricStatus("Initializing biometric...");
    setLoading(true);
    try {
      if (!hasBiometricRegistered()) {
        const name = userId || "User";
        const ok = await registerBiometric(name);
        if (ok) {
          setBiometricStatus("✅ Biometric registered! Verifying...");
          await new Promise(r => setTimeout(r, 800));
          router.push("/dashboard");
        } else {
          setBiometricStatus("❌ Registration failed. Try again.");
          setLoading(false);
        }
      } else {
        const ok = await authenticateWithBiometric();
        if (ok) {
          setBiometricStatus("✅ Identity verified!");
          await new Promise(r => setTimeout(r, 500));
          router.push("/dashboard");
        } else {
          setBiometricStatus("❌ Biometric failed. Use password.");
          setLoading(false);
        }
      }
    } catch {
      setBiometricStatus("❌ Error. Use password login.");
      setLoading(false);
    }
  };

  return (
    <main className="w-full h-screen fixed top-0 left-0 bg-[var(--color-medical-bg)] flex items-center justify-center p-4 md:p-12 overflow-hidden z-[100]">
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ repeat: Infinity, duration: 8 }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white rounded-full blur-[100px] pointer-events-none" />
      <motion.div animate={{ x: [0, 50, 0], y: [0, -50, 0] }} transition={{ repeat: Infinity, duration: 12 }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#b4cbce] rounded-full blur-[120px] opacity-40 pointer-events-none" />

      <div className="w-full max-w-5xl h-full max-h-[820px] glass-panel border border-white/40 shadow-2xl flex flex-col md:flex-row overflow-hidden relative z-10">
        {/* Left: Branding */}
        <div className="w-full md:w-1/2 bg-[#1a1c1c] text-white p-12 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#39ff14] rounded-full blur-[100px] opacity-20 pointer-events-none" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="w-32 h-32 rounded-full border-4 border-[#39ff14] bg-[#b4cbce] mb-8 overflow-hidden shadow-[0_0_30px_rgba(57,255,20,0.4)]">
              <img src="/anime_mascot.png" alt="Dr. B-MAX" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-5xl font-black mb-4 tracking-tighter">{isLogin ? "Welcome Back." : "Initialize."}</h1>
            <p className="text-[#b4cbce] text-lg font-medium leading-relaxed max-w-sm">
              Your 100% offline biometric medical companion. Secure, private, and extremely fast.
            </p>
          </motion.div>
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white/50 backdrop-blur-md relative">
          <AnimatePresence mode="wait">
            <motion.div key={isLogin ? "login" : "signup"} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="w-full max-w-sm mx-auto">
              <h2 className="text-3xl font-extrabold text-[#1a1c1c] mb-8">{isLogin ? t("authenticate") : t("userId")}</h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FaUser className="text-[#b4cbce]" aria-hidden="true" /></div>
                  <input type="text" id="userId" aria-label={t("userId")} required placeholder={t("userId")} value={userId} onChange={e => setUserId(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-[16px] bg-white border-2 border-transparent focus:outline-none focus:border-[#39ff14] font-medium text-[#1a1c1c] placeholder:text-[#b4cbce] shadow-sm transition-all" />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FaLock className="text-[#b4cbce]" aria-hidden="true" /></div>
                  <input type="password" id="password" aria-label={t("password")} required placeholder={t("password")} value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-[16px] bg-white border-2 border-transparent focus:outline-none focus:border-[#39ff14] font-medium text-[#1a1c1c] placeholder:text-[#b4cbce] shadow-sm transition-all" />
                </div>
                <button disabled={loading} type="submit" aria-label={t("authenticate")}
                  className="w-full py-4 rounded-[16px] bg-[#1a1c1c] text-white font-bold text-lg hover:bg-[#424849] transition-all flex items-center justify-center gap-2 group">
                  {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-6 h-6 border-2 border-white rounded-full border-t-transparent" /> : <>{t("authenticate")} <FaArrowRight className="group-hover:translate-x-1 transition-transform text-[#39ff14]" aria-hidden="true" /></>}
                </button>
              </form>

              {/* Biometric Section */}
              {biometricAvailable && (
                <div className="mt-4">
                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-[#b4cbce]/40" /><span className="text-xs text-[#424849] font-bold">OR</span>
                    <div className="flex-1 h-px bg-[#b4cbce]/40" />
                  </div>
                  <button onClick={handleBiometric} disabled={loading} aria-label={hasBiometricRegistered() ? t("useBiometrics") : "Setup Biometric Login"}
                    className="w-full py-4 rounded-[16px] bg-[#39ff14]/10 border-2 border-[#39ff14] text-[#1a1c1c] font-bold flex items-center justify-center gap-3 hover:bg-[#39ff14]/20 transition-all">
                    <FaFingerprint className="text-[#39ff14] text-xl" aria-hidden="true" />
                    {hasBiometricRegistered() ? t("useBiometrics") : "Setup Biometric Login"}
                  </button>
                  {biometricStatus && <p className="text-center text-xs font-bold mt-2 text-[#424849]">{biometricStatus}</p>}
                </div>
              )}

              <div className="mt-6 text-center">
                <button onClick={() => setIsLogin(!isLogin)} className="text-[#424849] font-bold hover:text-[#1a1c1c] transition-colors text-sm">
                  {isLogin ? "Need a clearance? Sign Up." : "Already have access? Log In."}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
