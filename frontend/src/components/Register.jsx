import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { googleSignIn } from '../services/authService';
import logoSwes from '../assets/icono_sistema.png';

const Register = () => {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [role, setRole] = useState('visitante');

  // REGISTRO NORMAL
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    const normalizedEmail = data.email?.toLowerCase().trim();

    // VALIDAR CORREO EPN
    if (!normalizedEmail?.endsWith('@epn.edu.ec')) {
      setMensaje({ 
        texto: 'Error: Solo se permiten correos institucionales @epn.edu.ec. Si eres visitante, usa "Registrarse con Google".', 
        tipo: 'error' 
      });
      return; 
    }

    // VALIDACIONES ESPECÍFICAS PARA EMPRENDEDOR
    if (role === 'emprendedor') {
      const phoneClean = data.phone?.trim();

      // 1. Validar que no esté vacío
      if (!phoneClean) {
        setMensaje({ texto: 'Error: El número de celular es obligatorio.', tipo: 'error' });
        return;
      }

      // 2. Validar que tenga exactamente 10 dígitos numéricos (Ej: 099xxxxxxx)
      const phoneRegex = /^0\d{9}$/; 
      if (!phoneRegex.test(phoneClean)) {
        setMensaje({ 
          texto: 'Error: El número de celular debe tener exactamente 10 dígitos y empezar con 0 (Ej: 09XXXXXXXX).', 
          tipo: 'error' 
        });
        return;
      }
    }

    try {
      const res = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: data.nombre,
          email: normalizedEmail,
          password: data.password,
          role: role,
          phone: data.phone || '',
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setMensaje({ texto: result.message || '¡Registro exitoso!', tipo: 'success' });
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        const errorText = result.message || 'El correo institucional o el celular ya se encuentran registrados.';
        setMensaje({ texto: `Error: ${errorText}`, tipo: 'error' });
      }
    } catch (error) {
      console.error(error);
      setMensaje({ texto: 'Error: Error de conexión con el servidor.', tipo: 'error' });
    }
  };

  // GOOGLE
  const handleGoogle = async () => {
    try {
      setMensaje({ texto: '', tipo: '' });
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email?.toLowerCase();
      const idToken = await result.user.getIdToken();
      const res = await googleSignIn(idToken);

      if (res) {
        localStorage.setItem('uid', result.user.uid);
        localStorage.setItem('email', email);
        localStorage.setItem('name', result.user.displayName || '');
        localStorage.setItem('role', 'visitante');
        
        setMensaje({ texto: '¡Inicio con Google exitoso!', tipo: 'success' });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        setMensaje({ texto: 'Error: No se pudo iniciar sesión con tu cuenta de Google.', tipo: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMensaje({ texto: 'Error con Google Sign-In.', tipo: 'error' });
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden">

      {/* FORMULARIO */}
      <div className="flex-1 flex items-center justify-center bg-gray-100 px-6 py-8">

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-4"
        >

          {/* LOGO */}
          <div className="flex flex-col items-center mb-2">
            <img
              src={logoSwes}
              alt="SWES"
              className="w-16 h-16 object-contain mb-3"
            />

            <h2 className="text-3xl font-bold text-gray-800">
              Crear cuenta
            </h2>

            <p className="text-sm text-gray-500 text-center mt-2">
              Plataforma de emprendimientos de la EPN
            </p>
          </div>

          {/* CONTENEDOR DE ALERTAS ESTILIZADAS */}
          {mensaje.texto && (
            <div
              className={`border-l-4 p-3 rounded-xl text-xs font-medium transition-all duration-300 ${
                mensaje.tipo === 'error'
                  ? 'bg-red-50 border-red-500 text-red-700'
                  : 'bg-green-50 border-green-500 text-green-700'
              }`}
            >
              {mensaje.tipo === 'error' ? '⚠️ ' : '✅ '}
              {mensaje.texto}
            </div>
          )}

          {/* ROL */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Tipo de usuario
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00665c]"
            >
              <option value="visitante">Visitante</option>
              <option value="emprendedor">Emprendedor</option>
            </select>
          </div>

          {/* NOMBRE */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Nombre completo
            </label>

            <input
              name="nombre"
              type="text"
              placeholder="Ingresa tu nombre"
              required
              className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00665c]"
            />
          </div>

          {/* EMAIL */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Correo institucional
            </label>

            <input
              name="email"
              type="email"
              placeholder="usuario@epn.edu.ec"
              required
              className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00665c]"
            />
          </div>

          {/* TELEFONO SOLO EMPRENDEDOR */}
          {role === 'emprendedor' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Número celular
              </label>

              <input
                name="phone"
                type="tel"
                maxLength={10} // Restringe visualmente a máximo 10 caracteres en el teclado
                placeholder="09XXXXXXXX"
                required
                className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00665c]"
              />
            </div>
          )}

          {/* PASSWORD */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Contraseña
            </label>

            <input
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
              className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00665c]"
            />
          </div>

          {/* BOTON REGISTRO */}
          <button
            type="submit"
            className="bg-[#00665c] hover:bg-[#004d45] text-white py-3 rounded-xl font-semibold transition mt-2"
          >
            Registrarse
          </button>

          {/* GOOGLE SOLO VISITANTE */}
          {role === 'visitante' && (
            <>
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400">o</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                className="border border-gray-300 bg-white hover:bg-gray-50 py-3 rounded-xl font-medium flex items-center justify-center gap-3 transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.94 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.77 2.93c.9-2.69 3.42-4.45 6.84-4.45z"/>
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.67 2.84c2.15-1.98 3.38-4.89 3.38-8.48z"/>
                  <path fill="#FBBC05" d="M5.16 14.51c-.23-.69-.36-1.43-.36-2.2s.13-1.51.36-2.2L1.39 7.56C.5 9.35 0 11.33 0 12.4c0 1.07.5 3.05 1.39 4.84l3.77-2.73z"/>
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.67-2.84c-1.1.74-2.51 1.18-4.29 1.18-3.42 0-5.94-1.76-6.84-4.45L1.39 16.91C3.37 20.33 7.35 23 12 23z"/>
                </svg>
                Registrarse con Google
              </button>
            </>
          )}

          {/* TEXTO */}
          <p className="text-xs text-center text-gray-500 mt-1">
            {role === 'emprendedor'
              ? 'Los emprendedores deben ingresar su número celular.'
              : 'Los visitantes pueden registrarse con correo institucional o Google.'}
          </p>

          {/* LOGIN */}
          <p className="text-center text-sm text-gray-600 mt-3">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="text-[#00665c] font-semibold hover:underline"
            >
              Inicia sesión
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-2">
            © 2026 Escuela Politécnica Nacional
          </p>

        </form>
      </div>

      {/* PANEL DERECHO */}
      <div className="hidden lg:flex w-1/2 bg-[#0f172a] items-center justify-center px-12">
        <div className="max-w-lg">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-sm">
            <h1 className="text-7xl font-bold text-white mb-5">SWES</h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Sistema web para impulsar los emprendimientos y talentos
              de los estudiantes de la Escuela Politécnica Nacional.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="bg-white/10 text-white text-sm px-4 py-2 rounded-full">Innovación</span>
              <span className="bg-white/10 text-white text-sm px-4 py-2 rounded-full">Emprendimiento</span>
              <span className="bg-white/10 text-white text-sm px-4 py-2 rounded-full">Tecnología</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Register;