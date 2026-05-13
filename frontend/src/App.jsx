import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* More routes coming soon: /menu, /reserve, /login, /admin */}
        </Routes>
      </main>
    </div>
  );
}

export default App;