//routes for each page

import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Preference from './pages/Preference'
import './App.css'
//import Navbar from './components/Navbar';

export default function App() {
  return (
    <div>
      {/* <Navbar /> */}
      <div className='main-content'>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/preference" element={<Preference />} />
      </Routes>
      </div>
    </div>
  );
}