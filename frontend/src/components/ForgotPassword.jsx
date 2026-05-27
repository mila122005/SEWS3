import { useState } from "react";
import { Link } from 'react-router-dom';
// 1. IMPORTAMOS DIRECTAMENTE LAS HERRAMIENTAS DE FIREBASE CLIENT
import { auth } from "../../firebase"; 
import { sendPasswordResetEmail } from "firebase/auth";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  // Guardamos un objeto de alerta con tipo para aplicar estilos semánticos
  const [alerta, setAlerta] = useState({ mostrar: false, texto: '', tipo: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlerta({ mostrar: false, texto: '', tipo: '' });
    setLoading(true);

    try {
      // 2. ENVIAR EL CORREO MEDIANTE EL SDK OFICIAL DE FIREBASE
      await sendPasswordResetEmail(auth, email.trim());
      
      setAlerta({ 
        mostrar: true, 
        texto: 'Enlace enviado de forma exitosa si el usuario se encuentra registrado.', 
        tipo: 'success' 
      });
      setSent(true);
    } catch (error) {
      console.error("Error completo Firebase:", error);
      
      // Mapeamos los códigos nativos que devuelve Firebase Authentication
      const firebaseErrors = {
        'auth/invalid-email': 'El formato del correo institucional ingresado no es válido.',
        'auth/user-not-found': 'No existe ninguna cuenta registrada con este correo electrónico.',
      };

      setAlerta({
        mostrar: true,
        texto: firebaseErrors[error.code] || 'Ocurrió un inconveniente al procesar la solicitud de recuperación.',
        tipo: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-brand-panel">
      <div className="max-w-sm w-full flex flex-col gap-4 bg-neutral-bg rounded-card px-8 py-10 shadow-form">

        {/* Encabezado */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-text leading-tight">
            Recuperar contraseña
          </h2>
          <p className="text-sm text-neutral-muted mt-1">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        {/* ALERTA VISUAL E INTUITIVA */}
        {alerta.mostrar && (
          <div className={`border-l-4 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all duration-300 ${
            alerta.tipo === 'error' 
              ? 'bg-red-50 border-red-500 text-red-700' 
              : 'bg-green-50 border-green-500 text-green-700'
          }`}>
            <span>{alerta.tipo === 'error' ? '⚠️' : '✅'}</span>
            <p>{alerta.texto}</p>
          </div>
        )}

        {/* Formulario o confirmación */}
        {!sent ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-neutral-text">Correo electrónico</label>
              <div className="flex items-center border border-neutral-border rounded-input px-3 gap-2 bg-white
                              focus-within:border-brand-primary focus-within:shadow-input transition-all">
                <svg className="w-4 h-4 text-neutral-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
                </svg>
                <input
                  type="email"
                  placeholder="usuario@epn.edu.ec"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="flex-1 py-2.5 text-sm text-neutral-text placeholder:text-neutral-muted outline-none bg-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00665c] hover:bg-[#004d45] disabled:bg-slate-300 text-white font-semibold
                         py-3 rounded-btn text-sm transition-all flex items-center justify-center gap-2 mt-1"
            >
              {loading ? 'Procesando...' : 'Enviar enlace de recuperación →'}
            </button>
          </form>

        ) : (
          /* Estado: correo enviado con éxito */
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-100">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xs text-neutral-muted text-center leading-relaxed">
              Revisa tu bandeja de entrada en tu correo de la Politécnica y sigue el enlace adjunto para restablecer tu contraseña de inmediato.
            </p>
          </div>
        )}

        {/* Link volver */}
        <p className="text-center text-sm text-neutral-muted mt-2">
          ¿Recordaste tu contraseña?{' '}
          <Link to="/login" className="text-brand-accent font-semibold hover:opacity-80 transition-opacity">
            Iniciar sesión
          </Link>
        </p>

        <p className="text-center text-xs text-neutral-subtle mt-1">© 2026 Escuela Politécnica Nacional</p>

      </div>
    </div>
  );
}

export default ForgotPassword;