import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { verifyAccount } from "../services/authService";

function VerifyAccount() {
  const location = useLocation();
  const [message, setMessage] = useState("Verificando cuenta...");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oobCode = params.get('oobCode');
    if (!oobCode) {
      setMessage('Código de verificación no encontrado en la URL');
      return;
    }

    const verify = async () => {
      try {
        const data = await verifyAccount(oobCode);
        setMessage(data.message || data.mensaje || 'Cuenta verificada');
      } catch (error) {
        setMessage(error.response?.data?.message || error.response?.data?.mensaje || "Error al verificar cuenta");
      }
    };

    verify();
  }, [location.search]);

  return <div><h2>Verificación</h2><p>{message}</p></div>;
}

export default VerifyAccount;