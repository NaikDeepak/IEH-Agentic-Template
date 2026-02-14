import React, { useState, useEffect, useRef } from 'react';
import {
    RecaptchaVerifier,
    linkWithPhoneNumber,
    type ConfirmationResult
} from 'firebase/auth';
import { auth, db } from '../../../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../../../hooks/useAuth';
import { Phone, CheckCircle2, Loader2, Send } from 'lucide-react';

export const PhoneVerification: React.FC = () => {
    const { user, userData, refreshUserData } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'phone' | 'code'>('phone');
    const [isSimulated, setIsSimulated] = useState(true);
    const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

    useEffect(() => {
        return () => {
            if (recaptchaRef.current) {
                recaptchaRef.current.clear();
                recaptchaRef.current = null;
            }
        };
    }, []);

    const setupRecaptcha = () => {
        recaptchaRef.current ??= new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {
                // reCAPTCHA solved, allow linkWithPhoneNumber.
            }
        });
    };

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setError(null);
        setIsLoading(true);

        if (isSimulated) {
            // MVP Simulation Logic
            setTimeout(() => {
                setIsLoading(false);
                setStep('code');
                alert('MVP SIMULATION: Use OTP "123456" to verify.');
            }, 1000);
            return;
        }

        setupRecaptcha();

        try {
            const appVerifier = recaptchaRef.current;
            if (!appVerifier) throw new Error('Recaptcha not initialized');

            const result = await linkWithPhoneNumber(user, phoneNumber, appVerifier);
            setConfirmationResult(result);
            setStep('code');
        } catch (err: unknown) {
            const error = err as { message?: string };
            console.error('Error sending code:', error);
            setError(error.message ?? 'Failed to send verification code. Please check the number format (e.g., +91XXXXXXXXXX).');
            if (recaptchaRef.current) {
                recaptchaRef.current.clear();
                recaptchaRef.current = null;
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setError(null);
        setIsLoading(true);

        try {
            if (isSimulated) {
                if (verificationCode !== '123456') {
                    throw new Error('Invalid simulated OTP');
                }
            } else {
                if (!confirmationResult) throw new Error('No confirmation result');
                await confirmationResult.confirm(verificationCode);
            }

            // Update Firestore
            await updateDoc(doc(db, 'users', user.uid), {
                phoneVerified: true,
                phoneNumber: isSimulated ? `SIM-${phoneNumber}` : phoneNumber
            });

            await refreshUserData();
        } catch (err: unknown) {
            const error = err as { message?: string };
            console.error('Error verifying code:', error);
            setError(error.message ?? 'Invalid verification code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (userData?.phoneVerified) {
        return (
            <div className="bg-green-50 border-2 border-green-600 p-6 flex items-center gap-4">
                <div className="bg-green-600 text-white p-2 rounded-full">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-green-900">Phone Verified</h3>
                    <p className="text-xs font-mono font-bold text-green-700 uppercase">Your account is secured with mobile verification.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-black text-white p-2">
                        <Phone className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-tight">Mobile Verification</h3>
                        <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Trust signal for referral rewards</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold uppercase text-gray-400">Simulation</span>
                    <button
                        onClick={() => { setIsSimulated(!isSimulated); }}
                        className={`w-8 h-4 border border-black relative transition-colors ${isSimulated ? 'bg-black' : 'bg-gray-200'}`}
                    >
                        <div className={`absolute top-0 w-4 h-full bg-white border border-black transition-all ${isSimulated ? 'right-0' : 'left-0'}`}></div>
                    </button>
                </div>
            </div>

            {isSimulated && (
                <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 text-[9px] font-mono text-yellow-700 uppercase font-bold">
                    MVP Simulation Mode: Real SMS charges are disabled. Use any number and OTP 123456.
                </div>
            )}

            <div id="recaptcha-container"></div>

            {step === 'phone' ? (
                <form onSubmit={(e) => { void handleSendCode(e); }} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="phone-input" className="text-[10px] font-mono font-bold text-black uppercase tracking-widest">Phone Number (with country code)</label>
                        <input
                            id="phone-input"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => { setPhoneNumber(e.target.value); }}
                            placeholder="+91 98765 43210"
                            required
                            className="w-full px-4 py-3 bg-white border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none text-sm font-mono"
                        />
                    </div>
                    {error && <p className="text-[10px] font-mono font-bold text-red-600 uppercase">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-6 bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all border-2 border-black flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send OTP</>}
                    </button>
                </form>
            ) : (
                <form onSubmit={(e) => { void handleVerifyCode(e); }} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="otp-input" className="text-[10px] font-mono font-bold text-black uppercase tracking-widest">Enter 6-digit OTP</label>
                        <input
                            id="otp-input"
                            type="text"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => { setVerificationCode(e.target.value); }}
                            placeholder="123456"
                            required
                            className="w-full px-4 py-3 bg-white border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none text-sm font-mono tracking-[0.5em] text-center"
                        />
                    </div>
                    {error && <p className="text-[10px] font-mono font-bold text-red-600 uppercase">{error}</p>}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => { setStep('phone'); }}
                            className="py-3 px-6 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all border-2 border-black"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="py-3 px-6 bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all border-2 border-black flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};
