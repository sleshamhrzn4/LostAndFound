import { useNavigate, useLocation } from "react-router";
import { Routes, Route } from "react-router";
import "./App.css";
import ItemsPage from "./pages/ItemsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";
import NavBar from "./components/NavBar";
import MyClaimsPage from './pages/MyClaimsPage';
import ClaimsPage from './pages/ClaimsPage';
import ResolvedItemsPage from './pages/Resolveditemspage';

function App() {
  const location = useLocation();
  const hideNavBar = location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      {!hideNavBar && <NavBar />}
      <Routes>
        <Route path="/" element={<ItemsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/my-claims" element={<MyClaimsPage />} />
        <Route path="/claims" element={<ClaimsPage />} />
        <Route path="/resolved" element={<ResolvedItemsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;