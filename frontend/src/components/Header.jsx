import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoSwes from '../assets/icono_sistema.png';
import { auth } from '../../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState(
    typeof window !== 'undefined'
      ? localStorage.getItem('name') || localStorage.getItem('displayName') || localStorage.getItem('email') || 'Usuario'
      : 'Usuario'
  );
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') || 'visitante' : 'visitante';

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName || user.email || localStorage.getItem('name') || 'Usuario');
      } else {
        setUsername(localStorage.getItem('name') || localStorage.getItem('email') || 'Usuario');
      }
    });
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const links = [
    { to: '/dashboard', label: 'Tablero' },
    ...(role !== 'visitante' ? [{ to: '/admin/products', label: 'Emprendimientos' }] : []),
  ];

  return (
    <nav className="bg-neutral-surface border-b border-neutral-border h-16 flex items-center px-8 relative z-50">
      <div className="w-full flex items-center justify-between">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 select-none">
          <img src={logoSwes} alt="SWES" className="w-7 h-7 object-contain" />
          <span className="font-bold text-neutral-text text-lg">SWES</span>
          <span className="font-bold text-brand-accent text-lg">EPN</span>
        </Link>

        {/* CONTENEDOR DERECHO */}
        <div className="flex items-center gap-6">
          
          {/* Links de Navegación */}
          <div className="flex items-center gap-1">
            {links.map(({ to, label }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-1.5 rounded-input text-sm font-medium transition-all
                    ${active
                      ? 'bg-brand-primary text-white'
                      : 'text-neutral-subtle hover:text-neutral-text hover:bg-neutral-bg'
                    }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Avatar con Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-9 h-9 rounded-full bg-brand-panel flex items-center justify-center
                         text-white font-semibold text-sm hover:opacity-90 transition-all border-2 border-neutral-border"
            >
              {username.charAt(0).toUpperCase()}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-neutral-surface border border-neutral-border
                              rounded-card shadow-form z-50 overflow-hidden animate-fadeIn">
                
                {/* Info básica del usuario */}
                <div className="px-4 py-3 border-b border-neutral-border bg-neutral-bg/30">
                  <p className="text-xs font-bold text-neutral-text">Hola, {username}</p>
                  <p className="text-[11px] text-neutral-muted truncate">Rol: {role === 'administrador' ? 'Administrador' : role === 'emprendedor' ? 'Emprendedor' : 'Visitante'}</p>
                </div>

                {/* Enlace a la nueva página de Perfil */}
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-subtle
                               hover:bg-neutral-bg hover:text-neutral-text transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Mi Perfil
                  </Link>
                </div>

                <Link
  to="/settings"
  onClick={() => setDropdownOpen(false)}
  className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-subtle
             hover:bg-neutral-bg hover:text-neutral-text transition-all"
>
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.325 4.317a1.724 1.724 0 013.35 0 1.724 1.724 0 002.573 1.066 1.724 1.724 0 012.37 2.37 1.724 1.724 0 001.065 2.572 1.724 1.724 0 010 3.351 1.724 1.724 0 00-1.066 2.573 1.724 1.724 0 01-2.37 2.37 1.724 1.724 0 00-2.572 1.065 1.724 1.724 0 01-3.351 0 1.724 1.724 0 00-2.573-1.066 1.724 1.724 0 01-2.37-2.37 1.724 1.724 0 00-1.065-2.572 1.724 1.724 0 010-3.351 1.724 1.724 0 001.066-2.573 1.724 1.724 0 012.37-2.37 1.724 1.724 0 002.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>

  Configuración
</Link>


                {/* Botón de Salida */}
                <div className="border-t border-neutral-border py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500
                               hover:bg-red-50/60 transition-all font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;