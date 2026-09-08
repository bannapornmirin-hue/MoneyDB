import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  AlertTriangle,
  Lock,
  Mail,
  User as UserIcon,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Info,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    loginWithGooglePopup,
    loginWithGoogleRedirectMode,
    loginWithEmailPassword,
    registerWithEmailPassword,
    authActionLoading,
    error,
    errorInfo,
    clearError,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'google' | 'signin' | 'signup'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'money-db-sooty.vercel.app';
  const isVercelOrCustom = !currentHostname.includes('localhost') && !currentHostname.includes('firebaseapp.com') && !currentHostname.includes('web.app');

  const handleCopyHost = () => {
    navigator.clipboard.writeText(currentHostname);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleGooglePopup = async () => {
    try {
      await loginWithGooglePopup();
    } catch {
      // Handled in context
    }
  };

  const handleGoogleRedirect = async () => {
    try {
      await loginWithGoogleRedirectMode();
    } catch {
      // Handled in context
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    try {
      if (activeTab === 'signup') {
        await registerWithEmailPassword(email.trim(), password, displayName.trim() || undefined);
      } else {
        await loginWithEmailPassword(email.trim(), password);
      }
    } catch {
      // Handled in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="modal-auth-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !authActionLoading && !submitting) {
          closeAuthModal();
        }
      }}
    >
      <div
        id="modal-auth-content"
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-gradient-to-b from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full p-0.5 bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="/phrae_vocational_logo.jpg"
                alt="โลโก้วิทยาลัยอาชีวศึกษาแพร่"
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-slate-900">เข้าสู่ระบบ MoneyDB</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  Firebase
                </span>
              </div>
              <p className="text-xs text-slate-500">วิทยาลัยอาชีวศึกษาแพร่</p>
            </div>
          </div>
          <button
            id="btn-close-auth-modal"
            onClick={closeAuthModal}
            disabled={authActionLoading || submitting}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1 gap-1 text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => {
              clearError();
              setActiveTab('google');
            }}
            className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === 'google'
                ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            เข้าด้วย Google (Gmail)
          </button>
          <button
            type="button"
            onClick={() => {
              clearError();
              setActiveTab('signin');
            }}
            className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === 'signin'
                ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            อีเมลและรหัสผ่าน
          </button>
          <button
            type="button"
            onClick={() => {
              clearError();
              setActiveTab('signup');
            }}
            className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            สมัครสมาชิกใหม่
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{error}</div>
              </div>

              {/* Special instructions for Unauthorized Domain (Common on Vercel deployment) */}
              {errorInfo?.isUnauthorizedDomain && (
                <div className="pt-2 border-t border-amber-200/80 space-y-2 text-slate-700">
                  <div className="font-semibold text-slate-800">
                    💡 วิธีแก้ปัญหาที่แนะนำ:
                  </div>
                  <div className="p-2.5 bg-white/80 rounded-lg border border-amber-200 text-[11px] space-y-1.5">
                    <p className="font-medium text-emerald-700">
                      ✅ วิธีที่ 1 (เร็วที่สุด ไม่ต้องตั้งค่า):
                    </p>
                    <p>
                      คลิกแท็บ <strong>"อีเมลและรหัสผ่าน"</strong> หรือ <strong>"สมัครสมาชิกใหม่"</strong> ด้านบน สามารถกรอกอีเมล Gmail ของคุณและตั้งรหัสผ่านเพื่อเข้าใช้งานและบันทึกข้อมูลได้ทันที 100%!
                    </p>
                  </div>

                  <div className="p-2.5 bg-white/80 rounded-lg border border-amber-200 text-[11px] space-y-1.5">
                    <p className="font-medium text-blue-700">
                      ⚙️ วิธีที่ 2 (เพิ่มโดเมนใน Firebase Console):
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600">
                      <li>เข้าสู่ระบบ Firebase Console (โครงการ moneydb-33b82)</li>
                      <li>ไปที่ <strong>Authentication</strong> &gt; <strong>Settings</strong> &gt; <strong>Authorized domains</strong></li>
                      <li>
                        กด <strong>Add domain</strong> แล้วใส่โดเมน:
                        <div className="flex items-center gap-1.5 mt-1">
                          <code className="px-2 py-1 rounded bg-slate-100 font-mono text-slate-800 border border-slate-200 font-semibold text-[11px]">
                            {currentHostname}
                          </code>
                          <button
                            type="button"
                            onClick={handleCopyHost}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold cursor-pointer transition-colors"
                          >
                            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                          </button>
                        </div>
                      </li>
                    </ol>
                    <a
                      href="https://console.firebase.google.com/project/moneydb-33b82/authentication/settings"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline pt-1 font-medium"
                    >
                      เปิด Firebase Console Authorized Domains <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Special instructions for Popup Blocked */}
              {errorInfo?.isPopupBlocked && (
                <div className="pt-2 border-t border-amber-200/80">
                  <p className="mb-2 text-slate-700">
                    หากเบราว์เซอร์บล็อกหน้าต่างป๊อปอัป คุณสามารถเข้าสู่ระบบด้วยโหมดเปลี่ยนหน้า (Redirect) ได้ทันที:
                  </p>
                  <button
                    type="button"
                    onClick={handleGoogleRedirect}
                    disabled={authActionLoading}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>เข้าสู่ระบบด้วย Google (แบบ Redirect)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: Google Sign-In */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-600 leading-relaxed">
                  คลิกปุ่มด้านล่างเพื่อเข้าสู่ระบบด้วยบัญชี Google หรือ Gmail ของคุณ
                </p>
              </div>

              {/* Google Primary Button */}
              <button
                id="btn-modal-google-signin"
                type="button"
                onClick={handleGooglePopup}
                disabled={authActionLoading}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-sm flex items-center justify-center gap-3 transition-all cursor-pointer hover:border-slate-400 disabled:opacity-50"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{authActionLoading ? 'กำลังเปิดหน้าต่าง...' : 'เข้าสู่ระบบด้วย Gmail (Google Popup)'}</span>
              </button>

              {/* Fallback Redirect Button */}
              <button
                type="button"
                onClick={handleGoogleRedirect}
                disabled={authActionLoading}
                className="w-full py-2 px-3 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>หรือใช้การเข้าสู่ระบบแบบ Redirect (เปลี่ยนหน้า)</span>
              </button>

              {/* Helpful hint for Vercel users */}
              {isVercelOrCustom && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>เข้าสู่ระบบไม่ได้บนโดเมนนี้?</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    หากกดเข้าด้วย Google แล้วขึ้นแจ้งเตือนโดเมน สามารถสลับไปใช้แท็บ <strong>"อีเมลและรหัสผ่าน"</strong> ด้านบนเพื่อเข้าใช้งานได้ทันทีโดยไม่ต้องรอตั้งค่าโดเมน
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2 & 3: Email & Password Form (Sign In or Sign Up) */}
          {(activeTab === 'signin' || activeTab === 'signup') && (
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div className="text-xs text-slate-500 mb-2">
                {activeTab === 'signup'
                  ? 'กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้ใหม่ด้วยอีเมลของคุณ'
                  : 'กรอกอีเมล (สามารถใช้อีเมล Gmail ของคุณได้) และรหัสผ่านเพื่อเข้าใช้งาน'}
              </div>

              {activeTab === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อที่แสดง (Display Name)
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="เช่น สมชาย ใจดี"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ที่อยู่อีเมล (Email)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="youremail@gmail.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || authActionLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {submitting
                    ? 'กำลังดำเนินการ...'
                    : activeTab === 'signup'
                    ? 'สร้างบัญชีและเข้าสู่ระบบ'
                    : 'เข้าสู่ระบบด้วยอีเมล'}
                </span>
              </button>

              <div className="pt-2 text-center">
                {activeTab === 'signup' ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab('signin')}
                    className="text-xs text-emerald-600 hover:underline cursor-pointer"
                  >
                    มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab('signup')}
                    className="text-xs text-emerald-600 hover:underline cursor-pointer"
                  >
                    ยังไม่มีบัญชี? สมัครสมาชิกใหม่ได้ทันที
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>ข้อมูลรายรับรายจ่ายจะถูกบันทึกแยกเฉพาะบัญชีของคุณอย่างปลอดภัย</span>
        </div>
      </div>
    </div>
  );
};
