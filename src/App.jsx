import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layouts";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MasterData from "./pages/MasterData";
import UserData from "./pages/UserData";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/master-data" element={<MasterData />} />
          <Route path="/users" element={<UserData />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
