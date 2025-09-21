import React from 'react';
import { useSelector } from 'react-redux';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AppShell from './pages/AppShell';

// Private route guard
function Private({ children }) {
  const token = useSelector((s) => s.auth.token);
  return token ? children : <Navigate to="/signin" replace />;
}

// Public-only guard: if already authenticated, send to /app immediately
function PublicOnly({ children }) {
  const token = useSelector((s) => s.auth.token);
  return token ? <Navigate to="/app" replace /> : children;
}

// Root redirect based on auth state
function RootRedirect() {
  const token = useSelector((s) => s.auth.token);
  return <Navigate to={token ? '/app' : '/signin'} replace />;
}

// Define router with future flags
const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  { path: '/signin', element: <PublicOnly><SignIn /></PublicOnly> },
  { path: '/signup', element: <PublicOnly><SignUp /></PublicOnly> },
  { path: '/app', element: <Private><AppShell /></Private> }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

export default function App() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
