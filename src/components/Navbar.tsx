import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, Database, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  onOpenNewTransaction: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewTransaction }) => {
  const { user, logout, loading, openAuthModal } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & App Title */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full p-0.5 bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0 transition-transform hover:scale-105">
            <img
              src="/phrae_vocational_logo.jpg"
              alt="โลโก้วิทยาลัยอาชีวศึกษาแพร่"
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                MoneyDB
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Database className="w-3 h-3 text-emerald-600" />
                Firebase
              </span>
            </div>
            <p className="text-xs text-slate-700 hidden sm:block">
              จัดการรายรับรายจ่าย บันทึกขึ้นคลาวด์ moneyDB • วิทยาลัยอาชีวศึกษาแพร่
            </p>
          </div>
        </div>

        {/* User Auth & Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                id="btn-add-transaction-nav"
                onClick={onOpenNewTransaction}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm cursor-pointer"
              >
                <span>+ บันทึกรายการ</span>
              </button>

              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[140px]">
                    {user.displayName || 'ผู้ใช้งาน Google'}
                  </div>
                  <div className="text-[11px] text-slate-700 truncate max-w-[140px]">
                    {user.email}
                  </div>
                </div>
                <button
                  id="btn-signout"
                  onClick={() => logout()}
                  title="ออกจากระบบ"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              id="btn-google-login"
              onClick={() => openAuthModal()}
              disabled={loading}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-60"
            >
              {/* Google G logo */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>เข้าสู่ระบบด้วย Gmail</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
