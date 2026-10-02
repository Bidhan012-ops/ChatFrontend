import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { signup } from '../services/Authservice';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socket } from '../lib/socket';
export default function Signup() {
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();
  const [errormessage, seterrormessage] = useState("");
  const { setUser } = useAuth();

  const submithandler = async (e) => {
    e.preventDefault();
    try {
      const result = await signup({
        name: usernameRef.current.value,
        email: emailRef.current.value,
        password: passwordRef.current.value
      });
      console.log("The result of the signup is: ", result);
      setUser(result.data.user);
      socket.emit("setup", result.data.user._id);
      navigate("/dashboard");
    } catch (error) {
      seterrormessage(error.response?.data.message || error.message);
    }
  }
  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen flex items-center justify-center bg-mesh font-body-md overflow-hidden relative">
      {/* Ambient glowing orbs for backdrop depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[var(--color-primary-container)] opacity-10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-[var(--color-secondary-container)] opacity-10 blur-[100px] pointer-events-none"></div>

      <main className="w-full max-w-[440px] px-[16px] md:px-0 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-[24px]">
          <h1 className="font-display-lg text-display-lg text-primary tracking-tight mb-[4px]">NeonChat</h1>
          <p className="font-body-lg text-body-lg text-[var(--color-on-surface-variant)]">Executive Suite</p>
        </div>

        {/* Glass Card */}
        <div className="glass-panel rounded-xl p-[24px] md:p-[32px] shadow-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
          <h2 className="font-headline-sm md:font-headline-md text-[24px] font-semibold text-[var(--color-on-surface)] mb-[24px]">Create Account</h2>
          {errormessage && (
            <p className="text-red-500 mb-[16px]">{errormessage}</p>
          )}
          <form onSubmit={submithandler} className="space-y-[16px]" method="POST">
            {/* Full Name */}
            <div>
              <label className="block font-label-caps text-label-caps text-[var(--color-on-surface-variant)] mb-[4px] uppercase" htmlFor="fullName">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] pointer-events-none">person</span>
                <input className="w-full input-glass rounded-lg py-2 pl-10 pr-3 text-[var(--color-on-surface)] font-body-md placeholder-[var(--color-outline-variant)] focus:ring-0" id="fullName" name="fullName" placeholder="Jane Doe" required type="text" ref={usernameRef} />
              </div>
            </div>

            {/* Work Email */}
            <div>
              <label className="block font-label-caps text-label-caps text-[var(--color-on-surface-variant)] mb-[4px] uppercase" htmlFor="email">Work Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] pointer-events-none">mail</span>
                <input className="w-full input-glass rounded-lg py-2 pl-10 pr-3 text-[var(--color-on-surface)] font-body-md placeholder-[var(--color-outline-variant)] focus:ring-0" id="email" name="email" placeholder="jane@company.com" required type="email" ref={emailRef} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-label-caps text-label-caps text-[var(--color-on-surface-variant)] mb-[4px] uppercase" htmlFor="password">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] pointer-events-none">lock</span>
                <input className="w-full input-glass rounded-lg py-2 pl-10 pr-3 text-[var(--color-on-surface)] font-body-md placeholder-[var(--color-outline-variant)] focus:ring-0" id="password" name="password" placeholder="••••••••" required type="password" ref={passwordRef} />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start mt-[16px] mb-[24px]">
              <div className="flex h-5 items-center">
                <input className="h-4 w-4 rounded border-[rgba(255,255,255,0.12)] bg-[var(--color-surface)] text-[var(--color-primary-container)] focus:ring-[var(--color-primary-container)] focus:ring-offset-[var(--color-surface)] cursor-pointer transition-colors" id="terms" name="terms" required type="checkbox" />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-body-md text-body-md text-[var(--color-on-surface-variant)]" htmlFor="terms">
                  I agree to the <a className="text-primary hover:text-inverse-primary transition-colors underline decoration-[rgba(255,255,255,0.12)] hover:decoration-primary" href="#">Terms of Service</a> and <a className="text-primary hover:text-inverse-primary transition-colors underline decoration-[rgba(255,255,255,0.12)] hover:decoration-primary" href="#">Privacy Policy</a>.
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button className="w-full btn-primary rounded-lg py-3 font-headline-sm text-headline-sm flex justify-center items-center gap-[8px] mt-[24px]" type="submit">
              <span>Create Account</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-[24px]">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgba(255,255,255,0.12)]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] font-label-caps text-label-caps uppercase rounded-sm">Or</span>
            </div>
          </div>

          {/* Sign in Link */}
          <div className="text-center">
            <p className="font-body-md text-body-md text-[var(--color-on-surface-variant)]">
              Already have an account?
              <Link className="font-headline-sm text-headline-sm text-primary hover:text-inverse-primary transition-colors ml-1" to="/signin">Sign in</Link>
            </p>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="text-center mt-[24px]">
          <p className="font-label-caps text-label-caps text-[var(--color-on-surface-variant)] opacity-50 uppercase">© 2024 NeonChat Executive. Secure access.</p>
        </div>
      </main>
    </div>
  );
}
