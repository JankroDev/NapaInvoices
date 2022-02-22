import React from "react";
import { useAuth } from "./contexts/AuthContext";
import { Route, Redirect, Navigate, Outlet } from "react-router-dom";
import InvoicesScreen from "./InvoicesScreen";
import { getAuth } from "firebase/auth";
import EntryForm from "./entryform";

export default function StoreUseRouter({ component: Component, ...rest }) {
  const auth = getAuth();

  return auth.currentUser.email == "sudoStoreEmail@gmail.com" ? (
    <EntryForm />
  ) : (
    <Navigate to="/invoicesScreen" />
  );
}
