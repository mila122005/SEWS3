import { useState } from "react";
import { useParams } from "react-router-dom";
import { resetPassword } from "../services/authService";
import logoSwes from '../assets/icono_sistema.png'; // Logo institucional

function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await resetPassword(token, newPassword);
      setMessage(data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error al cambiar contraseña");
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 bg-neutral-bg">
      
      {/* Contenedor con la clase card estilizada en Tailwind */}
      <section className="w-full max-w-md p-10 bg-white rounded-2xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] text-gray-800">
        
        {/* Encabezado */}
        <div className="flex flex-col items-center mb-8 text-center">
          <img src={logoSwes} alt="SWES EPN" className="w-12 h-12 object-contain mb-3 select-none" />
          <h2 className="text-xl font-bold text-gray-950 tracking-tight sm:text-2xl">
            Nueva contraseña
          </h2>
          <p className="text-gray-400 text-xs mt-1.5 max-w-xs font-medium">
            Ingresa tu nueva clave de acceso para tu cuenta de SWES EPN.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-xs text-gray-400 uppercase tracking-wider">Nueva Contraseña</label>
            <input 
              type="password" 
              placeholder="Nueva contraseña" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 font-medium transition-all outline-none focus:bg-white focus:border-[#00665c] focus:ring-4 focus:ring-[#00665c]/10"
            />
          </div>

          <button className="w-full mt-2 py-3 bg-[#00665c] hover:bg-[#004d45] text-white text-xs font-bold rounded-xl shadow-xs transition-all uppercase tracking-wider">
            Cambiar contraseña
          </button>
        </form>

        {/* Mensaje de respuesta */}
        {message && (
          <p className="mt-5 p-3 text-center text-xs font-semibold rounded-xl bg-neutral-bg border border-gray-100 text-gray-700 animate-fadeIn">
            {message}
          </p>
        )}

      </section>
    </div>
  );
}

export default ResetPassword;