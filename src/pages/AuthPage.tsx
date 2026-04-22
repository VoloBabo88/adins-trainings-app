import { useState } from 'react'
import { Dumbbell, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Spinner } from '../components/Spinner'

export function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inp: React.CSSProperties = {
    background: '#1e1e1e', border: '1px solid #333', borderRadius: 10,
    padding: '14px 16px', color: '#fff', fontSize: 16, width: '100%',
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'E-Mail oder Passwort falsch.'
        : error.message)
      setLoading(false)
    }
    // On success: onAuthStateChange fires → App re-renders → keep loading shown
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwörter stimmen nicht überein.'); return }
    if (password.length < 6) { setError('Mindestens 6 Zeichen.'); return }
    setLoading(true)

    // Step 1: Create auth user
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Registrierung fehlgeschlagen. Bitte erneut versuchen.')
      setLoading(false)
      return
    }

    // Step 2: Create profile row
    const { error: profileErr } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, username: name, onboarding_done: false })

    // Ignore unique-violation (profile already exists from a previous attempt)
    if (profileErr && profileErr.code !== '23505') {
      setError('Profil konnte nicht erstellt werden.')
      setLoading(false)
      return
    }

    // Step 3: If signUp didn't return a session (email confirmation enabled),
    // sign in explicitly so onAuthStateChange fires and the app navigates forward.
    if (!data.session) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
      if (signInErr) {
        // Email confirmation is required — inform the user
        setError('Bitte bestätige deine E-Mail-Adresse und melde dich dann an.')
        setLoading(false)
        return
      }
    }

    // onAuthStateChange now fires → useAuth updates user → App shows OnboardingWrapper
    // Keep the loading spinner visible during the transition
  }

  return (
    <div style={{ minHeight: '100%', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px 40px' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ background: 'rgba(124,58,237,0.15)', borderRadius: 20, padding: 16 }}>
            <Dumbbell size={40} color="#7c3aed" />
          </div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: 4 }}>ADIN</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#7c3aed', letterSpacing: 3, marginTop: 4 }}>TRAININGS APP</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#1a1a1a', borderRadius: 12, padding: 4, marginBottom: 24, width: '100%', maxWidth: 340 }}>
        {(['login', 'register'] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setError('') }} style={{
            flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer', borderRadius: 10,
            background: tab === t ? '#7c3aed' : 'transparent',
            color: tab === t ? '#fff' : '#888',
            fontWeight: 700, fontSize: 15, fontFamily: 'inherit', transition: 'all 0.2s',
          }}>
            {t === 'login' ? 'Anmelden' : 'Registrieren'}
          </button>
        ))}
      </div>

      {/* Card */}
      <div style={{ background: '#1a1a1a', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340 }}>
        {tab === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>E-Mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="deine@email.de" required style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Passwort</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  style={{ ...inp, paddingRight: 48 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#555',
                }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}
              style={{ marginTop: 4, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {loading ? <Spinner size={20} /> : 'Anmelden'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Dein Name" required style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>E-Mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="deine@email.de" required style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Passwort</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Mindestens 6 Zeichen" required
                  style={{ ...inp, paddingRight: 48 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#555',
                }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Passwort wiederholen</label>
              <input type={showPass ? 'text' : 'password'} value={confirm}
                onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required style={inp} />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}
              style={{ marginTop: 4, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {loading ? <Spinner size={20} /> : 'Account erstellen'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
