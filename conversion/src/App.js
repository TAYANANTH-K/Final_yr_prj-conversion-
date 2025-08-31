import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ModulePage from "./ModulePage";
import TextToSign from "./TextToSign";
import SignToText from "./SignToText";
import Translator from "./Translator";
import Animator from "./animator";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className="navigation">
          <div className="nav-brand">
            <h1>Sign Language Translator</h1>
          </div>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/text-to-sign" className="nav-link">Text to Sign</Link>
            <Link to="/sign-to-text" className="nav-link">Sign to Text</Link>
            
            <Link to="/translator" className="nav-link">Translator</Link>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<ModulePage />} />
            <Route path="/text-to-sign" element={<TextToSign />} />
            <Route path="/sign-to-text" element={<SignToText />} />
            <Route path="/animator" element={<Animator />} />
            <Route path="/translator" element={<Translator />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
