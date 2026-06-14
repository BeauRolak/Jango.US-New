import { Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';
import Layout from './components/Layout';
import './pages/pages.css';
import Dashboard from './pages/Dashboard';
import Games from './pages/Games';
import Profile from './pages/Profile';
import Wallet from './pages/Wallet';
import Tournaments from './pages/Tournaments';
import Rankings from './pages/Rankings';
import Shop from './pages/Shop';
import Training from './pages/Training';
import Social from './pages/Social';
import Story from './pages/Story';
import Settings from './pages/Settings';
import MiniGolf from './games/minigolf/MiniGolf';

function P({ children }: { children: ReactNode }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<P><Dashboard /></P>} />
      <Route path='/games' element={<P><Games /></P>} />
      <Route path='/games/minigolf' element={<P><MiniGolf /></P>} />
      <Route path='/profile' element={<P><Profile /></P>} />
      <Route path='/wallet' element={<P><Wallet /></P>} />
      <Route path='/tournaments' element={<P><Tournaments /></P>} />
      <Route path='/rankings' element={<P><Rankings /></P>} />
      <Route path='/shop' element={<P><Shop /></P>} />
      <Route path='/training' element={<P><Training /></P>} />
      <Route path='/social' element={<P><Social /></P>} />
      <Route path='/story' element={<P><Story /></P>} />
      <Route path='/settings' element={<P><Settings /></P>} />
      <Route path='*' element={<P><Dashboard /></P>} />
    </Routes>
  );
}
