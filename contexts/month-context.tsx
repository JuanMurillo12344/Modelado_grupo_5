"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface MonthContextType {
  month: number
  year: number
  setMonth: (month: number) => void
  setYear: (year: number) => void
  goToPreviousMonth: () => void
  goToNextMonth: () => void
  getMonthName: () => string
}

const MonthContext = createContext<MonthContextType | undefined>(undefined)

export function MonthProvider({ children }: { children: ReactNode }) {
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  const goToPreviousMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  const getMonthName = () => {
    return new Date(year, month - 1).toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    })
  }

  return (
    <MonthContext.Provider
      value={{
        month,
        year,
        setMonth,
        setYear,
        goToPreviousMonth,
        goToNextMonth,
        getMonthName,
      }}
    >
      {children}
    </MonthContext.Provider>
  )
}

export function useMonth() {
  const context = useContext(MonthContext)
  if (context === undefined) {
    throw new Error("useMonth debe usarse dentro de MonthProvider")
  }
  return context
}
