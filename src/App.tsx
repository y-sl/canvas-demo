import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MultiLanguageEditor } from "./pages/MultiLanguageEditor";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MultiLanguageEditor />} />
        <Route path="*" element={<MultiLanguageEditor />} />
      </Routes>
    </Router>
  );
}
