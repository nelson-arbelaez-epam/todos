import { Route, Routes } from 'react-router-dom';
import NavBar from './components/atoms/NavBar/NavBar';
import MainLayout from './components/templates/MainLayout/MainLayout';
import About from './pages/About';
import Home from './pages/Home';
import Register from './pages/Register';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Register', to: '/register' },
];

function App() {
  return (
    <MainLayout
      header={
        <NavBar
          links={NAV_LINKS}
          brand={<span className="font-semibold text-text-h">Todos</span>}
        />
      }
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
