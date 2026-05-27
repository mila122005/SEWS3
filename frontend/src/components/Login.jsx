import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { auth } from '../../firebase';

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

import { googleSignIn } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();

  const [mensaje, setMensaje] = useState({
    texto: '',
    tipo: '',
  });

  const [verPassword, setVerPassword] = useState(false);

  // =========================================
  // LOGIN NORMAL
  // =========================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setMensaje({
      texto: '',
      tipo: '',
    });

    const { email, password } = Object.fromEntries(
      new FormData(e.target)
    );

    // VALIDAR CORREO EPN

    if (!email.toLowerCase().endsWith('@epn.edu.ec')) {
      setMensaje({
        texto:
          'Solo se permiten correos institucionales @epn.edu.ec',
        tipo: 'error',
      });

      return;
    }

    try {
      // LOGIN FIREBASE

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // URL BACKEND RENDER

      const API_URL = import.meta.env.VITE_API_URL;

      // LOGIN BACKEND

      const res = await fetch(
        `${API_URL}/api/login`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      // LOGIN OK

      if (res.ok) {
        localStorage.setItem('uid', data.uid);

        localStorage.setItem(
          'token',
          data.token
        );

        localStorage.setItem(
          'role',
          data.role || 'visitante'
        );

        localStorage.setItem(
          'email',
          data.email
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
        }, 1000);

      } else {
        setMensaje({
          texto:
            data.mensaje ||
            'Credenciales incorrectas',
          tipo: 'error',
        });
      }

    } catch (error) {
      console.error(error);

      setMensaje({
        texto:
          'Correo o contraseña incorrectos',
        tipo: 'error',
      });
    }
  };

  // =========================================
  // LOGIN GOOGLE
  // =========================================

  const handleGoogleLogin = async () => {
    setMensaje({
      texto: '',
      tipo: '',
    });

    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(
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

    } catch (error) {
      console.error(error);

      setMensaje({
        texto:
          'Error con Google Sign-In',
        tipo: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="text-3xl font-bold text-center">
          Login SWES
        </h1>

        {/* MENSAJE */}

        {mensaje.texto && (
          <div
            className={`text-sm p-3 rounded-xl text-center ${
              mensaje.tipo === 'error'
                ? 'bg-red-100 text-red-600'
                : 'bg-green-100 text-green-600'
            }`}
          >
            {mensaje.texto}
          </div>
        )}

        {/* EMAIL */}

        <input
          type="email"
          name="email"
          placeholder="correo@epn.edu.ec"
          required
          className="border p-3 rounded-xl outline-none"
        />

        {/* PASSWORD */}

        <div className="relative">

          <input
            type={
              verPassword
                ? 'text'
                : 'password'
            }
            name="password"
            placeholder="********"
            required
            className="border p-3 rounded-xl outline-none w-full"
          />

          <button
            type="button"
            onClick={() =>
              setVerPassword(!verPassword)
            }
            className="absolute right-3 top-3 text-sm"
          >
            {verPassword
              ? 'Ocultar'
              : 'Ver'}
          </button>
        </div>

        {/* BOTON LOGIN */}

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-semibold"
        >
          Ingresar
        </button>

        {/* GOOGLE */}

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="border p-3 rounded-xl font-semibold hover:bg-gray-50"
        >
          Ingresar con Google
        </button>

        {/* REGISTER */}

        <p className="text-center text-sm">
          ¿No tienes cuenta?{' '}

          <Link
            to="/register"
            className="text-blue-600 font-semibold"
          >
            Registrarse
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;