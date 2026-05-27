import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { googleSignIn } from '../services/authService';
import logoSwes from '../assets/icono_sistema.png';

// URL DEL BACKEND
const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const navigate = useNavigate();

  const [mensaje, setMensaje] = useState({
    texto: '',
    tipo: '',
  });

  const [verPassword, setVerPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setMensaje({
      texto: '',
      tipo: '',
    });

    const { email, password } =
      Object.fromEntries(new FormData(e.target));

    const normalizedEmail =
      email.toLowerCase().trim();

    if (
      !normalizedEmail.endsWith('@epn.edu.ec')
    ) {
      setMensaje({
        texto:
          'Solo se permiten correos institucionales @epn.edu.ec. Si eres visitante, usa "Ingresar con Google".',
        tipo: 'error',
      });

      return;
    }

    try {
      // LOGIN FIREBASE
      await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );

      // LOGIN BACKEND
      const res = await fetch(
        `${API_URL}/api/login`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            email: normalizedEmail,
            password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem(
          'uid',
          data.uid || ''
        );

        localStorage.setItem(
          'token',
          data.token || ''
        );

        localStorage.setItem(
          'role',
          data.role || 'visitante'
        );

        localStorage.setItem(
          'email',
          data.email || normalizedEmail
        );

        localStorage.setItem(
          'name',
          data.name || ''
        );

        if (data.phone) {
          localStorage.setItem(
            'phone',
            data.phone
          );
        }

        setMensaje({
          texto: '¡Bienvenido!',
          tipo: 'success',
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 800);

      } else {
        setMensaje({
          texto:
            data.mensaje ||
            'Credenciales incorrectas',
          tipo: 'error',
        });
      }

    } catch (error) {
      console.error(
        'Error en el login:',
        error
      );

      setMensaje({
        texto:
          'Correo o contraseña incorrectos',
        tipo: 'error',
      });
    }
  };

  // GOOGLE
  const handleGoogleLogin = async () => {
    setMensaje({
      texto: '',
      tipo: '',
    });

    try {
      const provider =
        new GoogleAuthProvider();

      const result =
        await signInWithPopup(
          auth,
          provider
        );

      const email =
        result.user.email?.toLowerCase();

      const idToken =
        await result.user.getIdToken();

      const res =
        await googleSignIn(idToken);

      if (res) {
        localStorage.setItem(
          'uid',
          result.user.uid
        );

        localStorage.setItem(
          'email',
          email
        );

        localStorage.setItem(
          'name',
          result.user.displayName || ''
        );

        localStorage.setItem(
          'role',
          'visitante'
        );

        navigate('/dashboard');

      } else {
        setMensaje({
          texto:
            'No se pudo iniciar sesión con Google',
          tipo: 'error',
        });
      }

    } catch (err) {
      console.error(err);

      setMensaje({
        texto:
          'Error con Google Sign-In',
        tipo: 'error',
      });
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden">

      {/* PANEL IZQUIERDO */}
      <div className="hidden md:flex w-1/2 bg-[#0f172a] flex-col justify-center px-10 py-12 gap-8">

        <div className="flex flex-col gap-8 items-start w-full">

          <div className="w-full bg-white/5 border border-white/10 rounded-3xl px-10 py-8 text-center">

            <h1 className="text-white text-7xl font-bold tracking-tight mb-4">
              SWES
            </h1>

            <p className="text-white/50 text-sm font-semibold tracking-widest uppercase leading-relaxed mb-3">
              Plataforma de Gestión
              <br />
              de Emprendimientos
            </p>

            <p className="text-[#00bfa6] text-xs font-medium">
              Impulsando la Innovación y el Talento Politécnico
            </p>

          </div>

          <div className="grid grid-cols-2 gap-4 w-full">

            <div className="bg-white/5 border border-white/10 rounded-3xl p-4">

              <div className="text-[#00bfa6] mb-2">

                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />

                </svg>

              </div>

              <p className="text-white text-sm font-semibold mb-1">
                Venture Tracker
              </p>

              <p className="text-white/40 text-xs leading-relaxed">
                Monitoreo de startups universitarias en tiempo real.
              </p>

            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-4">

              <div className="text-[#00bfa6] mb-2">

                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75"
                  />

                </svg>

              </div>

              <p className="text-white text-sm font-semibold mb-1">
                Fondeo
              </p>

              <p className="text-white/40 text-xs leading-relaxed">
                Gestión eficiente de recursos y capital semilla.
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* FORMULARIO */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 px-16 py-6">

        <form
          onSubmit={handleLogin}
          className="max-w-sm w-full flex flex-col gap-3"
        >

          <div className="flex flex-col items-center mb-2">

            <img
              src={logoSwes}
              alt="SWES"
              className="w-16 h-16 object-contain mb-3"
            />

            <h2 className="text-3xl font-bold text-gray-800 text-center">
              Iniciar sesión
            </h2>

            <p className="text-sm text-gray-500 text-center mt-2">
              Bienvenido de vuelta
            </p>

          </div>

          {/* EMAIL */}
          <div className="flex flex-col gap-1">

            <label className="text-sm font-medium text-gray-700">
              Correo electrónico
            </label>

            <div className="flex items-center border border-gray-300 rounded-xl px-3 gap-2 bg-white focus-within:ring-2 focus-within:ring-[#00665c] transition-all">

              <svg
                className="w-4 h-4 text-gray-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75"
                />

              </svg>

              <input
                name="email"
                type="email"
                placeholder="usuario@epn.edu.ec"
                required
                className="flex-1 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
              />

            </div>

          </div>

          {/* PASSWORD */}
          <div className="flex flex-col gap-1">

            <div className="flex items-center justify-between">

              <label className="text-sm font-medium text-gray-700">
                Contraseña
              </label>

              <Link
                to="/forgot-password"
                className="text-xs text-gray-500 hover:text-[#00665c]"
              >
                ¿Olvidó su contraseña?
              </Link>

            </div>

            <div className="flex items-center border border-gray-300 rounded-xl px-3 gap-2 bg-white focus-within:ring-2 focus-within:ring-[#00665c] transition-all">

              <svg
                className="w-4 h-4 text-gray-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />

              </svg>

              <input
                name="password"
                type={
                  verPassword
                    ? 'text'
                    : 'password'
                }
                placeholder="••••••••"
                required
                className="flex-1 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
              />

              <button
                type="button"
                onClick={() =>
                  setVerPassword(
                    !verPassword
                  )
                }
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                👁️
              </button>

            </div>

          </div>

          {/* MENSAJE */}
          {mensaje.texto && (
            <div
              className={`text-sm px-4 py-3 rounded-xl text-center font-medium ${
                mensaje.tipo === 'error'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-green-50 text-green-600 border border-green-200'
              }`}
            >
              {mensaje.texto}
            </div>
          )}

          {/* LOGIN */}
          <button
            type="submit"
            className="w-full bg-[#00665c] hover:bg-[#004d45] text-white font-semibold py-3 rounded-xl text-sm transition-all"
          >
            Ingresar al Sistema
          </button>

          <div className="flex items-center gap-3 my-1">

            <div className="flex-1 h-px bg-gray-300"></div>

            <span className="text-xs text-gray-400">
              o
            </span>

            <div className="flex-1 h-px bg-gray-300"></div>

          </div>

          {/* GOOGLE */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full border border-gray-300 bg-white hover:bg-gray-50 py-3 rounded-xl font-medium flex items-center justify-center gap-3 transition text-sm text-gray-700"
          >

            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
            >
              <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.94 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.77 2.93c.9-2.69 3.42-4.45 6.84-4.45z"/>
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.67 2.84c2.15-1.98 3.38-4.89 3.38-8.48z"/>
              <path fill="#FBBC05" d="M5.16 14.51c-.23-.69-.36-1.43-.36-2.2s.13-1.51.36-2.2L1.39 7.56C.5 9.35 0 11.33 0 12.4c0 1.07.5 3.05 1.39 4.84l3.77-2.73z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.67-2.84c-1.1.74-2.51 1.18-4.29 1.18-3.42 0-5.94-1.76-6.84-4.45L1.39 16.91C3.37 20.33 7.35 23 12 23z"/>
            </svg>

            Ingresar con Google

          </button>

          <p className="text-center text-sm text-gray-500">

            ¿No tienes una cuenta?{' '}

            <Link
              to="/register"
              className="text-[#00665c] font-semibold hover:underline"
            >
              Registrarse
            </Link>

          </p>

          <p className="text-center text-xs text-gray-400">
            © 2026 Escuela Politécnica Nacional
          </p>

        </form>

      </div>

    </div>
  );
};

export default Login;