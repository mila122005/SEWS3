import { useEffect, useState } from "react";

import {
  Navigate,
  useLocation
} from "react-router-dom";

import {
  onAuthStateChanged
} from "firebase/auth";

import { auth } from "../../firebase";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') || 'visitante' : 'visitante';
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Firebase aún cargando

  if (user === undefined) {

    return (
      <div className="text-center mt-10">
        Cargando...
      </div>
    );
  }

  // No autenticado
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role === 'visitante' && location.pathname.startsWith('/admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;