// Extrae el array de cualquier forma de respuesta de la API
export function toArr(data) {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (typeof data === 'object') {
    // Devuelve el primer valor que sea array
    for (const val of Object.values(data)) {
      if (Array.isArray(val)) return val
    }
  }
  return []
}

// Extrae el total para paginación — maneja tanto { total } como { pagination: { total } }
export function toTotal(data) {
  if (!data || typeof data !== 'object') return 0
  return (
    data.pagination?.total ??
    data.total ??
    data.count ??
    data.totalItems ??
    data.totalRegistros ??
    0
  )
}
