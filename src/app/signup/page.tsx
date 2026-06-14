'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '../actions/auth';
import { Mail, Lock, User, UserPlus, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';

function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await signUp(formData);

    if (result.success) {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push(redirect);
        router.refresh();
      }, 2000);
    } else {
      setError(result.error || 'Failed to register account. Please try again.');
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
              — Join The Club —
            </span>
            <h2 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              CREATE <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>ACCOUNT</span>
            </h2>
            <div style={{ width: '60px', height: '1px', background: 'var(--primary)', margin: '15px auto 0 auto' }}></div>
          </div>

          {success ? (
            <div style={{
              background: 'rgba(54, 179, 126, 0.1)',
              border: '1px solid rgba(54, 179, 126, 0.3)',
              color: '#36b37e',
              padding: '20px',
              fontSize: '0.9rem',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              lineHeight: '1.6'
            }}>
              ✨ Registration Successful! <br />
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Redirecting you to login...</span>
            </div>
          ) : (
            <>
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
                    Full Name
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <User size={16} style={{ position: 'absolute', left: '15px', color: 'rgba(212, 164, 75, 0.6)' }} />
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="Enter your full name"
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
                      placeholder="Min 6 characters"
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
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '15px', color: 'rgba(212, 164, 75, 0.6)' }} />
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      placeholder="Re-type your password"
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
                  {loading ? 'CREATING MEMBERSHIP...' : 'CREATE ACCOUNT'} <UserPlus size={16} />
                </button>
              </form>
            </>
          )}

          <div style={{
            marginTop: '30px',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-muted)'
          }}>
            <span>
              Already have an account?{' '}
              <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} style={{
                color: 'var(--primary)',
                fontWeight: 600,
                borderBottom: '1px solid transparent',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}
              >
                Sign In
              </Link>
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: '#0B0705',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--primary)',
        fontFamily: 'var(--font-cormorant)',
        fontSize: '1.5rem',
        letterSpacing: '0.1em'
      }}>
        LOADING SALOON LOBBY...
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
