/**
 * Utilidades para formatear fechas en hora de Ecuador
 */

/**
 * Formatea una fecha a hora de Ecuador (UTC-5)
 * @param date - Fecha en formato ISO string o Date object
 * @param options - Opciones de formato
 * @returns String con la fecha formateada
 */
export function formatEcuadorDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Guayaquil',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options
  }
  
  return dateObj.toLocaleDateString('es-EC', defaultOptions)
}

/**
 * Formatea una fecha y hora a hora de Ecuador
 * @param date - Fecha en formato ISO string o Date object
 * @returns String con fecha y hora formateada
 */
export function formatEcuadorDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return dateObj.toLocaleString('es-EC', {
    timeZone: 'America/Guayaquil',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Formatea solo la hora en formato 12 horas (Ecuador)
 * @param date - Fecha en formato ISO string o Date object
 * @returns String con la hora formateada (ej: "7:26 PM")
 */
export function formatEcuadorTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return dateObj.toLocaleTimeString('es-EC', {
    timeZone: 'America/Guayaquil',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Obtiene la fecha actual de Ecuador como Date object
 * @returns Date object en hora de Ecuador
 */
export function getEcuadorNow(): Date {
  // Crear fecha en UTC
  const now = new Date()
  
  // Convertir a Ecuador (UTC-5)
  const ecuadorTime = new Date(now.toLocaleString('en-US', { 
    timeZone: 'America/Guayaquil' 
  }))
  
  return ecuadorTime
}

/**
 * Verifica si una fecha es hoy (en hora de Ecuador)
 * @param date - Fecha a verificar
 * @returns true si es hoy en Ecuador
 */
export function isToday(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = getEcuadorNow()
  
  const dateStr = formatEcuadorDate(dateObj, { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
  
  const todayStr = formatEcuadorDate(today, { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
  
  return dateStr === todayStr
}
