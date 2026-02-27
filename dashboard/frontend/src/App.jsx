import { AnimatePresence, motion } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import OverviewPage from "./pages/OverviewPage";
import MonitoringPage from "./pages/MonitoringPage";
import InferencePage from "./pages/InferencePage";
import AnalysisPage from "./pages/AnalysisPage";

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.2 }}
      >
        <Routes location={location}>
          <Route element={<Layout />}>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
            <Route path="/inference" element={<InferencePage />} />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
