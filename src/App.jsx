import { HashRouter, Route } from 'react-router-dom';
import GlobalBackground from './components/GlobalBackground';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import ShutterTransition from './components/ShutterTransition';
import AudioToggle from './components/AudioToggle';
import { AudioProvider } from './context/AudioContext';
import { CharactersProvider } from './context/CharactersContext';
import HomePage from './pages/HomePage';
import RosterPage from './pages/RosterPage';
import CharacterProfile from './pages/CharacterProfile';
import LorePage from './pages/LorePage';
import ArcadePage from './pages/ArcadePage';
import AdminPage from './pages/AdminPage';
import NotFound from './pages/NotFound';

function CrtOverlay() {
  return (
    <div className="crt-overlay" aria-hidden="true">
      <div className="crt-scanlines" />
      <div className="crt-vignette" />
      <div className="crt-curvature" />
      <div className="crt-grain" />
    </div>
  );
}

export default function App() {
  return (
    <>
      <CrtOverlay />
      <GlobalBackground />
      <CustomCursor />
      <CharactersProvider>
        <AudioProvider>
          <AudioToggle />
          <HashRouter>
            <Navbar />
            <ShutterTransition>
              <Route path="/" element={<HomePage />} />
              <Route path="/roster" element={<RosterPage />} />
              <Route path="/character/:id" element={<CharacterProfile />} />
              <Route path="/lore" element={<LorePage />} />
              <Route path="/arcade" element={<ArcadePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFound />} />
            </ShutterTransition>
          </HashRouter>
        </AudioProvider>
      </CharactersProvider>
    </>
  );
}
