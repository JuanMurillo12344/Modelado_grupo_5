import { useEffect, useRef } from 'react'

/**
 * Hook para actualizar componentes automáticamente cada cierto intervalo
 * @param callback - Función a ejecutar periódicamente
 * @param delay - Intervalo en milisegundos (default: 30000 = 30 segundos)
 * @param enabled - Si está habilitado el polling (default: true)
 */
export function usePolling(callback: () => void, delay: number = 30000, enabled: boolean = true) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    const tick = () => {
      savedCallback.current()
    }

    const id = setInterval(tick, delay)
    return () => clearInterval(id)
  }, [delay, enabled])
}
