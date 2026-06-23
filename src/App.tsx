// build-bump: deposit route v2 1781737701811
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "./components/UI";
import { RewardLayer } from "./components/Juice";
import type { ReactNode } from "react";
import Layout from "./components/Layout";
import PublicShell from "./components/PublicShell";
import { useAuth } from "./lib/auth";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Play from "./pages/Play";
import Games from "./pages/Games";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import Deposit from "./pages/Deposit";
import Tournaments from "./pages/Tournaments";
import Rankings from "./pages/Rankings";
import Clans from "./pages/Clans";
import BattlePass from "./pages/BattlePass";
import RankTrack from "./pages/RankTrack";
import Shop from "./pages/Shop";
import Training from "./pages/Training";
import Social from "./pages/Social";
import Story from "./pages/Story";
import Settings from "./pages/Settings";
import Rewards from "./pages/Rewards";
import MiniGolf from "./games/minigolf/MiniGolf";
import Connect4 from "./games/connect4/Connect4";
import RPS from "./games/rps/RPS";
import DotsBoxes from "./games/dotsboxes/DotsBoxes";
import Chess from "./games/chess/Chess";
import EightBall from "./games/eightball/EightBall";
import AirHockey from "./games/airhockey/AirHockey";
import Bowling from "./games/bowling/Bowling";
import Basketball from "./games/basketball/Basketball";
import Football from "./games/football/Football";
import StackTower from "./games/stacktower/StackTower";
import BlockBlast from "./games/blockblast/BlockBlast";
import Tron from "./games/tron/Tron";
import CupKing from "./games/cupking/CupKing";
import Racing from "./games/racing/Racing";
import { Terms, Privacy, FairPlay, ResponsibleGaming, Contact } from "./pages/Info";

function P({ children }: { children: ReactNode }) {
  return <div className={"page-fade"}>{children}</div>;
}

/** App page behind auth: redirect guests to login, otherwise render in the app shell. */
function Protected({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <Layout><P>{children}</P></Layout>;
}

/** Home: marketing landing for guests, the app Dashboard for members. */
function Home() {
  const { user } = useAuth();
  return user ? <Layout><P><Dashboard /></P></Layout> : <Landing />;
}

/** Public content (legal pages): app shell when signed in, slim public shell otherwise. */
function Public({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return user ? <Layout><P>{children}</P></Layout> : <PublicShell><P>{children}</P></PublicShell>;
}

/** Auth screens: bounce already-signed-in users back to the app. */
function GuestOnly({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<GuestOnly><Auth mode="login" /></GuestOnly>} />
        <Route path="/signup" element={<GuestOnly><Auth mode="signup" /></GuestOnly>} />
        <Route path="/play" element={<Protected><Play /></Protected>} />
        <Route path="/games" element={<Protected><Games /></Protected>} />
        <Route path="/games/minigolf" element={<Protected><MiniGolf /></Protected>} />
        <Route path="/games/connect4" element={<Protected><Connect4 /></Protected>} />
        <Route path="/games/rps" element={<Protected><RPS /></Protected>} />
        <Route path="/games/dotsboxes" element={<Protected><DotsBoxes /></Protected>} />
        <Route path="/games/chess" element={<Protected><Chess /></Protected>} />
        <Route path="/games/eightball" element={<Protected><EightBall /></Protected>} />
        <Route path="/games/airhockey" element={<Protected><AirHockey /></Protected>} />
        <Route path="/games/bowling" element={<Protected><Bowling /></Protected>} />
        <Route path="/games/basketball" element={<Protected><Basketball /></Protected>} />
        <Route path="/games/football" element={<Protected><Football /></Protected>} />
        <Route path="/games/stacktower" element={<Protected><StackTower /></Protected>} />
        <Route path="/games/blockblast" element={<Protected><BlockBlast /></Protected>} />
        <Route path="/games/tron" element={<Protected><Tron /></Protected>} />
        <Route path="/games/cupking" element={<Protected><CupKing /></Protected>} />
        <Route path="/games/racing" element={<Protected><Racing /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/wallet" element={<Protected><Wallet /></Protected>} />
        <Route path="/deposit" element={<Protected><Deposit /></Protected>} />
        <Route path="/tournaments" element={<Protected><Tournaments /></Protected>} />
        <Route path="/rankings" element={<Protected><Rankings /></Protected>} />
        <Route path="/leaderboard" element={<Protected><Rankings /></Protected>} />
        <Route path="/clans" element={<Protected><Clans /></Protected>} />
        <Route path="/battle-pass" element={<Protected><BattlePass /></Protected>} />
        <Route path="/rank-progression" element={<Protected><RankTrack /></Protected>} />
        <Route path="/shop" element={<Protected><Shop /></Protected>} />
        <Route path="/training" element={<Protected><Training /></Protected>} />
        <Route path="/tutorial" element={<Protected><Training /></Protected>} />
        <Route path="/social" element={<Protected><Social /></Protected>} />
        <Route path="/story" element={<Protected><Story /></Protected>} />
        <Route path="/settings" element={<Protected><Settings /></Protected>} />
        <Route path="/rewards" element={<Protected><Rewards /></Protected>} />
        <Route path="/terms" element={<Public><Terms /></Public>} />
        <Route path="/privacy" element={<Public><Privacy /></Public>} />
        <Route path="/fair-play" element={<Public><FairPlay /></Public>} />
        <Route path="/responsible-gaming" element={<Public><ResponsibleGaming /></Public>} />
        <Route path="/contact" element={<Public><Contact /></Public>} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Toaster />
      <RewardLayer />
    </>
  );
}
