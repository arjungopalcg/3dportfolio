import { useEffect, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Experience } from "./ui/Experience";
import { FallbackView } from "./ui/FallbackView";
import { hasWebGL2 } from "./utils/webgl";
import { startSessionTracking } from "./analytics/analytics";

export default function App() {
  const webglOk = useMemo(() => hasWebGL2(), []);

  useEffect(() => startSessionTracking(), []);

  return (
    <BrowserRouter>
      <Routes>
        {webglOk ? (
          <>
            <Route path="/" element={<Experience />} />
            <Route path="/world/:id" element={<Experience />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Navigate to="/fallback" replace />} />
            <Route path="/world/:id" element={<Navigate to="/fallback" replace />} />
          </>
        )}
        <Route path="/fallback" element={<FallbackView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
