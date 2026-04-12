import { Route, Routes } from 'react-router-dom';
import NavBar from './components/atoms/NavBar/NavBar';
import MainLayout from './components/templates/MainLayout/MainLayout';
import About from './pages/About';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { useSessionStore } from './store/session-store';

function App() {
  const currentUser = useSessionStore((state) => state.currentUser);
  const logout = useSessionStore((state) => state.logout);

  const navLinks = currentUser
    ? [
        { label: 'Home', to: '/' },
        { label: 'About', to: '/about' },
      ]
    : [
        { label: 'Home', to: '/' },
        { label: 'About', to: '/about' },
        { label: 'Login', to: '/login' },
        { label: 'Register', to: '/register' },
      ];

  return (
    <MainLayout
      header={
        <NavBar
          links={navLinks}
          brand={<span className="font-semibold text-text-h">Todos</span>}
          actions={
            currentUser ? (
              <button
                type="button"
                onClick={logout}
                className="text-sm font-medium text-text transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Sign out
              </button>
            ) : undefined
          }
        />
      }
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
