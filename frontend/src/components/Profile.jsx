import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';

function Profile() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('Usuario');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUsername(user.displayName || 'Usuario');
      setEmail(user.email || '');
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto my-12 rounded-3xl bg-white px-8 py-10 shadow-xl shadow-slate-200">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h2 className="text-3xl font-semibold text-slate-900">Mi perfil</h2>
        <p className="mt-2 text-sm text-slate-500">
          Revisa tu información y cambia contraseña si lo necesitas.
        </p>
      </div>

      <div className="grid gap-5">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Nombre</p>
          <p className="mt-2 text-base font-medium text-slate-900">{username}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Correo</p>
          <p className="mt-2 text-base font-medium text-slate-900">{email}</p>
          <p className="mt-2 text-sm text-slate-500">El correo no puede cambiarse desde aquí.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Institución</p>
          <p className="mt-2 text-base font-medium text-[#00665c]">Escuela Politécnica Nacional</p>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={() => navigate('/profile/edit')}
          className="rounded-full bg-[#00665c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#004d45]"
        >
          Editar información
        </button>
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Cambiar contraseña
        </button>
      </div>
    </div>
  );
}

export default Profile;
