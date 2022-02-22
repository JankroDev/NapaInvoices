import "./App.css";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import InvoicesScreen from "./InvoicesScreen";
import Login from "./Login";
import { AuthProvider } from "./contexts/AuthContext";
import { getAuth } from "firebase/auth";
import PrivateRouter from "./PrivateRouter";
import StoreUseRouter from "./StoreUseRouter";

function App() {
  const { currentUser } = getAuth();

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PrivateRouter />} />
          <Route path="/login" element={<Login />} />
          <Route path="/invoicesScreen" element={<PrivateRouter />} />
          <Route path="/entryform" element={<StoreUseRouter />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
