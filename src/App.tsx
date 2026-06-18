// build-bump: deposit route v2 1781737701811
import { Routes, Route } from "react-router-dom";
import type { ReactNode } from "react";
import Layout from "./components/Layout";
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

function P({ children }: { children: ReactNode }) {
  return <div className={"page-fade"}>{children}</div>;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<P><Dashboard /></P>} />
        <Route path="/play" element={<P><Play /></P>} />
        <Route path="/games" element={<P><Games /></P>} />
        <Route path="/games/minigolf" element={<P><MiniGolf /></P>} />
        <Route path="/games/connect4" element={<P><Connect4 /></P>} />
        <Route path="/games/rps" element={<P><RPS /></P>} />
        <Route path="/games/dotsboxes" element={<P><DotsBoxes /></P>} />
        <Route path="/games/chess" element={<P><Chess /></P>} />
        <Route path="/games/eightball" element={<P><EightBall /></P>} />
        <Route path="/games/airhockey" element={<P><AirHockey /></P>} />
        <Route path="/games/bowling" element={<P><Bowling /></P>} />
        <Route path="/games/basketball" element={<P><Basketball /></P>} />
        <Route path="/games/football" element={<P><Football /></P>} />
        <Route path="/games/stacktower" element={<P><StackTower /></P>} />
        <Route path="/games/blockblast" element={<P><BlockBlast /></P>} />
        <Route path="/games/tron" element={<P><Tron /></P>} />
        <Route path="/games/cupking" element={<P><CupKing /></P>} />
        <Route path="/games/racing" element={<P><Racing /></P>} />
        <Route path="/profile" element={<P><Profile /></P>} />
        <Route path="/wallet" element={<P><Wallet /></P>} />
        <Route path="/deposit" element={<P><Deposit /></P>} />
        <Route path="/tournaments" element={<P><Tournaments /></P>} />
        <Route path="/rankings" element={<P><Rankings /></P>} />
        <Route path="/leaderboard" element={<P><Rankings /></P>} />
        <Route path="/clans" element={<P><Clans /></P>} />
        <Route path="/battle-pass" element={<P><BattlePass /></P>} />
        <Route path="/rank-progression" element={<P><RankTrack /></P>} />
        <Route path="/shop" element={<P><Shop /></P>} />
        <Route path="/training" element={<P><Training /></P>} />
        <Route path="/tutorial" element={<P><Training /></P>} />
        <Route path="/social" element={<P><Social /></P>} />
        <Route path="/story" element={<P><Story /></P>} />
        <Route path="/settings" element={<P><Settings /></P>} />
        <Route path="*" element={<P><Dashboard /></P>} />
      </Routes>
    </Layout>
  );
}
