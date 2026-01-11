import { LandingPage } from './pages/LandingPage'
import { Header } from './components/Header'
import { RoleSelection } from './components/RoleSelection'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <RoleSelection />
      <main className="flex-grow">
        <LandingPage />
      </main>
    </div>
  )
}

export default App
