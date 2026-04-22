import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useProfile } from './hooks/useProfile'
import { Profile } from './lib/supabase'
import { AuthPage } from './pages/AuthPage'
import { OnboardingWrapper } from './pages/onboarding/OnboardingWrapper'
import { TrainingPage } from './pages/TrainingPage'
import { FortschrittPage } from './pages/FortschrittPage'
import { ErnährungPage } from './pages/ErnährungPage'
import { ProfilPage } from './pages/ProfilPage'
import { MehrPage } from './pages/MehrPage'
import { BottomNav } from './components/BottomNav'
import { Spinner } from './components/Spinner'
import { ToastContainer } from './components/Toast'

type Tab = 'training' | 'fortschritt' | 'ernaehrung' | 'profil' | 'mehr'

function FullSpinner() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
      <Spinner size={40} />
    </div>
  )
}

function MainApp({ userId, onSignOut }: { userId: string; onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>('training')
  const { profile, loading, updateProfile, refetch } = useProfile(userId)

  if (loading) return <FullSpinner />

  const update = async (updates: Partial<Profile>) => {
    const r = await updateProfile(updates)
    await refetch()
    return r
  }

  return (
    <div className="app-container">
      {tab === 'training'    && <TrainingPage    userId={userId} profile={profile} />}
      {tab === 'fortschritt' && <FortschrittPage userId={userId} />}
      {tab === 'ernaehrung'  && <ErnährungPage   userId={userId} profile={profile} />}
      {tab === 'profil'      && <ProfilPage      userId={userId} profile={profile} onSignOut={onSignOut} onTabChange={t => setTab(t)} onUpdateProfile={update} />}
      {tab === 'mehr'        && <MehrPage        profile={profile} onUpdateProfile={update} />}
      <BottomNav active={tab} onChange={setTab} />
      <ToastContainer />
    </div>
  )
}

export default function App() {
  const { user, loading, signOut } = useAuth()
  const { profile, loading: profLoading, refetch } = useProfile(user?.id)

  if (loading || (user && profLoading)) {
    return <div className="app-container"><FullSpinner /></div>
  }

  if (!user) {
    return <div className="app-container"><AuthPage /><ToastContainer /></div>
  }

  if (!profile?.onboarding_done) {
    return <div className="app-container"><OnboardingWrapper userId={user.id} onComplete={refetch} /><ToastContainer /></div>
  }

  return <MainApp userId={user.id} onSignOut={signOut} />
}
