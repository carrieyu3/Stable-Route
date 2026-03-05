//routes for each page

import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import './App.css'
//import Navbar from './components/Navbar';

function App() {
  return (
    <div>
      {/* <Navbar /> */}
      <div className='main-content'>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
      </Routes>
      </div>
    </div>
  );
}

export default App