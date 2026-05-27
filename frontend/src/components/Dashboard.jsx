import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { FaWhatsapp } from 'react-icons/fa';

import SidebarFilters from './SidebarFilters';
import { getAll } from '../services/crudService';

function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categoriaActiva, setCategoriaActiva] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  const navigate = useNavigate();

  const role =
    typeof window !== 'undefined'
      ? localStorage.getItem('role') || 'visitante'
      : 'visitante';

  const storedNameRaw =
    typeof window !== 'undefined'
      ? localStorage.getItem('name') || localStorage.getItem('displayName') || localStorage.getItem('email') || ''
      : '';

  let storedName = (storedNameRaw || '').toString().trim();
  if (/^hola[,\s]/i.test(storedName)) {
    storedName = storedName.replace(/^hola[,\s]*/i, '').trim();
  }
  if (storedName === '' || /^usuario$/i.test(storedName)) {
    storedName = 'Visitante';
  }

  const userName = storedName && storedName.includes('@') ? storedName.split('@')[0] : storedName || 'Visitante';

  let userEmail = '';
  if (typeof window !== 'undefined') {
    userEmail = localStorage.getItem('email') || '';
    if (!userEmail && storedNameRaw && storedNameRaw.includes('@')) {
      userEmail = storedNameRaw;
    }
  }

  const [displayNameState, setDisplayNameState] = useState(userName);
  const [displayEmailState, setDisplayEmailState] = useState(userEmail);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const dn = user.displayName || user.email || userName;
        setDisplayNameState(dn);
        setDisplayEmailState(user.email || userEmail);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await getAll('products');
        setItems(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  const productosFiltrados = items.filter((it) => {
    const categoria = (it.category || '').toLowerCase();
    const nombre = (it.name || '').toLowerCase();
    const descripcion = (it.description || '').toLowerCase();

    const coincideCategoria =
      categoriaActiva === 'todas' || categoria === categoriaActiva.toLowerCase();

    const coincideBusqueda =
      nombre.includes(busqueda.toLowerCase()) || descripcion.includes(busqueda.toLowerCase());

    return coincideCategoria && coincideBusqueda;
  });

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <div className="max-w-[1500px] mx-auto px-5 py-6">

        {/* HEADER */}
        <div className="bg-white border border-gray-200 rounded-2xl px-8 py-7 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Dashboard de Emprendimientos</h1>

              <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:gap-3">
                <div>
                  <span className="rounded-full bg-[#e7f6f2] px-3 py-1 text-sm font-medium text-[#00665c]">Hola, {userName}</span>
                  <div className="text-sm text-slate-500 mt-1">{userEmail || 'Correo no disponible'}</div>
                </div>

                <span className="rounded-full border border-[#c7eae2] bg-white px-3 py-1 text-sm text-slate-600">Rol: {role === 'administrador' ? 'Administrador' : role === 'emprendedor' ? 'Emprendedor' : 'Visitante'}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Buscar emprendimientos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full sm:w-[300px] bg-[#f8fafb] border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00665c]"
              />

              {role !== 'visitante' && (
                <button onClick={() => navigate('/admin/products/new')} className="w-full sm:w-auto bg-[#00665c] hover:bg-[#004d45] text-white px-5 py-3 rounded-xl text-sm font-semibold transition">
                  Publicar emprendimiento
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">

          {/* SIDEBAR - sticky on large screens */}
          <aside className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:overflow-auto lg:min-w-[300px]">
            <SidebarFilters
              categoriaActiva={categoriaActiva}
              setCategoriaActiva={setCategoriaActiva}
              alLimpiarFiltros={() => {
                setCategoriaActiva('todas');
                setBusqueda('');
              }}
            />
          </aside>

          {/* PRODUCTOS */}
          <section>
            {loading ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">Cargando emprendimientos...</div>
            ) : productosFiltrados.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">No existen emprendimientos registrados</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {productosFiltrados.map((it) => {
                  const rawPhone = it.sellerPhone || it.phone || it.telefono || it.contactPhone || '';
                  const phoneDigits = rawPhone ? rawPhone.toString().replace(/\D/g, '') : '';
                  const hasPhone = phoneDigits && phoneDigits.length >= 6;

                  return (
                    <div key={it.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">

                    {/* IMAGEN */}
                    <div className="h-56 bg-gray-100 overflow-hidden">
                      {it.image || it.imagen ? (
                        <img src={it.image || it.imagen} alt={it.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Imagen no disponible</div>
                      )}
                    </div>

                    {/* CONTENIDO */}
                    <div className="p-5 flex flex-col">
                      <div className="mb-3">
                        <span className="bg-[#eef7f5] text-[#00665c] text-xs font-semibold px-3 py-1 rounded-full">{it.category || 'General'}</span>
                      </div>

                      <div className="flex justify-between gap-3 items-start">
                        <h2 className="text-lg font-bold text-gray-800 leading-tight">{it.name}</h2>
                        <span className="text-lg font-bold text-[#00665c] whitespace-nowrap">${parseFloat(it.price || 0).toFixed(2)}</span>
                      </div>

                      <p className="text-sm text-gray-600 mt-4 leading-relaxed line-clamp-3 flex-1">{it.description || 'Sin descripción disponible'}</p>

                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <p className="text-xs uppercase text-gray-400 tracking-wide">Vendedor</p>
                        <p className="text-sm font-semibold text-slate-800 mt-1">{it.sellerName || it.nombre || 'Anónimo'}</p>


                        {hasPhone ? (
                          <a
                            href={`https://wa.me/${phoneDigits}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center mt-4 w-full gap-2 border border-[#00665c] bg-[#00665c] text-white rounded-xl py-2.5 text-sm font-medium transition hover:opacity-95"
                          >
                            <FaWhatsapp className="h-4 w-4" />
                            Contactar por WhatsApp
                          </a>
                        ) : (
                          <div className="inline-flex items-center justify-center mt-4 w-full gap-2 border border-gray-200 text-gray-400 bg-gray-50 rounded-xl py-2.5 text-sm font-medium">
                            <FaWhatsapp className="h-4 w-4 text-gray-400" />
                            WhatsApp no disponible
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
