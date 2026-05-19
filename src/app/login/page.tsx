'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
      } else {
        router.push(redirect);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
      setLoading(false);
    }
  }

  return (
    <main style={{ position: 'relative', minHeight: '100vh', background: 'transparent' }}>
      <Header />
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '180px 20px 100px 20px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Decorative Ambient Background Glows */}
        <div style={{
          position: 'absolute',
          top: '25%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(212, 164, 75, 0.08) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: -1
        }} />

        <div style={{
          width: '100%',
          maxWidth: '480px',
          background: 'rgba(18, 13, 11, 0.7)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(15px)',
          padding: '50px 40px',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.8)',
          position: 'relative'
        }}>
          {/* Gold Decorative Corner Brackets */}
          <div style={{ position: 'absolute', top: '15px', left: '15px', width: '20px', height: '20px', borderTop: '2px solid var(--primary)', borderLeft: '2px solid var(--primary)' }} />
          <div style={{ position: 'absolute', top: '15px', right: '15px', width: '20px', height: '20px', borderTop: '2px solid var(--primary)', borderRight: '2px solid var(--primary)' }} />
          <div style={{ position: 'absolute', bottom: '15px', left: '15px', width: '20px', height: '20px', borderBottom: '2px solid var(--primary)', borderLeft: '2px solid var(--primary)' }} />
          <div style={{ position: 'absolute', bottom: '15px', right: '15px', width: '20px', height: '20px', borderBottom: '2px solid var(--primary)', borderRight: '2px solid var(--primary)' }} />

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{
              color: 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.4em',
              fontSize: '11px',
              fontWeight: 600,
              display: 'block',
              marginBottom: '10px'
            }}>
              — Welcome Back —
            </span>
            <h2 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              GUEST <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>LOGIN</span>
            </h2>
            <div style={{ width: '60px', height: '1px', background: 'var(--primary)', margin: '15px auto 0 auto' }}></div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '12px 16px',
              fontSize: '0.85rem',
              marginBottom: '25px',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{
                color: 'var(--primary)',
                fontSize: '9px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.2em'
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ position: 'absolute', left: '15px', color: 'rgba(212, 164, 75, 0.6)' }} />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(212, 164, 75, 0.2)',
                    padding: '16px 16px 16px 45px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(212, 164, 75, 0.2)'}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{
                color: 'var(--primary)',
                fontSize: '9px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.2em'
              }}>
                Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: '15px', color: 'rgba(212, 164, 75, 0.6)' }} />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(212, 164, 75, 0.2)',
                    padding: '16px 16px 16px 45px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(212, 164, 75, 0.2)'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'var(--primary)',
                color: 'black',
                padding: '18px',
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.2em',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '15px',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 0 20px rgba(212, 164, 75, 0.2)',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'AUTHENTICATING...' : 'SIGN IN'} <LogIn size={16} />
            </button>
          </form>

          <div style={{
            marginTop: '30px',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <span>
              Don't have an account?{' '}
              <Link href={`/signup?redirect=${encodeURIComponent(redirect)}`} style={{
                color: 'var(--primary)',
                fontWeight: 600,
                borderBottom: '1px solid transparent',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}
              >
                Sign Up Now
              </Link>
            </span>
            <Link href="/" style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              opacity: 0.6,
              marginTop: '5px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              Back to main lobby
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
