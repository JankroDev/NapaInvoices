import React from 'react'
import {useAuth} from "./contexts/AuthContext"
import { Route, Redirect, Navigate, Outlet } from 'react-router-dom'
import InvoicesScreen from './InvoicesScreen';
import { getAuth } from 'firebase/auth';

export default function PrivateRouter({component: Component, ...rest}) {

    const {currentUser} = getAuth();

    return currentUser ? <InvoicesScreen /> : <Navigate to="/login" />  ;
  }

