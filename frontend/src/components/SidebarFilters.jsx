import React from 'react';

function SidebarFilters({ categoriaActiva, setCategoriaActiva, alLimpiarFiltros }) {
  
  // CORREGIDO: El 'id' ahora coincide exactamente con el 'value' del formulario
  const categorias = [
    { id: 'Comida', label: 'Comida y Snacks', icon: '🍔' },
    { id: 'Tecnología', label: 'Tecnología / Software', icon: '💻' },
    { id: 'Ropa', label: 'Ropa y Accesorios', icon: '👕' },
    { id: 'Servicios', label: 'Servicios Académicos / Tutorías', icon: '📚' },
    { id: 'Otros', label: 'Otros', icon: '✨' },
  ];

  return (
    <aside className="w-full bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-6 select-none h-fit shadow-sm">
      
      <h2 className="text-lg font-bold text-gray-800">Filtros</h2>

      {/* BLOQUE CATEGORÍAS */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">Categorías</span>
        <div className="flex flex-col gap-1">
          
          {/* Botón para "Todas" */}
          <button
            onClick={() => setCategoriaActiva('todas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left
              ${categoriaActiva === 'todas'
                ? 'bg-[#00665c]/10 text-[#00665c] font-semibold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <span>🌐</span> Todas las Categorías
          </button>

          {/* Mapeo de categorías reales */}
          {categorias.map((cat) => {
            const isActive = categoriaActiva === cat.id; 
            return (
              <button
                key={cat.id}
                onClick={() => setCategoriaActiva(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left
                  ${isActive 
                    ? 'bg-[#00665c]/10 text-[#00665c] font-semibold' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span className="truncate">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTÓN GENERAL DE LIMPIAR */}
      <button 
        onClick={alLimpiarFiltros}
        className="w-full py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-all mt-2"
      >
        Limpiar Filtros
      </button>

    </aside>
  );
}

export default SidebarFilters;