import { Link, Route, Routes } from 'react-router-dom';
import About from './pages/About';
import Home from './pages/Home';
import Register from './pages/Register';
import './App.css';

function App() {
  return (
    <div className="App">
      <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link> |{' '}
        <Link to="/register">Register</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
