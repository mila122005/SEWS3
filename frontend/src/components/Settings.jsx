import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';

function Settings() {

  const [alerta, setAlerta] = useState({ mostrar: false, texto: '', tipo: '' });
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    setAlerta({ mostrar: false, texto: '', tipo: '' });
    setLoading(true);

    try {

      await sendPasswordResetEmail(
        auth,
        auth.currentUser.email
      );

      setAlerta({
        mostrar: true,
        texto: '¡Enlace enviado! Revisa tu bandeja de entrada de tu correo electronico.',
        tipo: 'success'
      });

    } catch (error) {

      console.error(error);

      setAlerta({
        mostrar: true,
        texto: 'Hubo un inconveniente al procesar la solicitud. Por favor, vuelve a intentarlo más tarde.',
        tipo: 'error'
      });
    }finally {
      setLoading(false);
    }
  };

  return (

    <div className="max-w-2xl mx-auto my-12 p-10 bg-white rounded-2xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] text-gray-800">

      {/* HEADER */}

      <div className="mb-8">

        <h2 className="text-2xl font-bold text-gray-950">
          Configuración
        </h2>

        <p className="text-sm text-gray-400 mt-1">
          Gestiona la seguridad de tu cuenta.
        </p>

      </div>

      {/* COMPONENTE DE ALERTA DINÁMICA */}
      
      {alerta.mostrar && (
        <div
          className={`mb-6 border-l-4 p-4 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-3 ${
            alerta.tipo === 'error'
              ? 'bg-red-50 border-red-500 text-red-700'
              : 'bg-green-50 border-green-500 text-green-700'
          }`}
        >
          <span className="text-base">{alerta.tipo === 'error' ? '⚠️' : '✅'}</span>
          <p>{alerta.texto}</p>
        </div>
      )}

      {/* TARJETA */}

      <div className="border border-gray-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>

          <h3 className="text-lg font-bold text-gray-900">
            Cambiar Contraseña
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Actualiza tu contraseña para mantener segura tu cuenta.
          </p>

        </div>

        <button
          onClick={handleResetPassword}
          className="px-5 py-3 bg-[#00665c] hover:bg-[#004d45] text-white text-xs font-bold rounded-xl transition-all uppercase tracking-wider"
        >

          Cambiar Contraseña

        </button>

      </div>

    </div>
  );
}

export default Settings;