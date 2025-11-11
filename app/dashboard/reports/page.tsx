"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MonthlyTrend } from "@/components/monthly-trend"
import { DashboardSummary } from "@/components/dashboard-summary"
import { IncomeList } from "@/components/income-list"
import { TransactionsList } from "@/components/transactions-list"
import { DailyActivityChart } from "@/components/daily-activity-chart"
import { TopCategoriesRanking } from "@/components/top-categories-ranking"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Download, TrendingUp, TrendingDown, PieChart } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ReportsPage() {
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [refreshKey, setRefreshKey] = useState(0)

  const handlePreviousMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  const monthName = new Date(year, month - 1).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Reportes</h1>
          <p className="text-muted-foreground">Análisis detallado de tus finanzas</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <Button variant="ghost" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2 min-w-[150px] text-center capitalize">
              {monthName}
            </span>
            <Button variant="ghost" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="income" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Ingresos</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2">
            <TrendingDown className="h-4 w-4" />
            <span className="hidden sm:inline">Gastos</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            📊
            <span className="hidden sm:inline">Tendencias</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB: Resumen General */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPIs del mes */}
          <DashboardSummary month={month} year={year} refreshKey={refreshKey} />
          
          {/* Actividad diaria del mes */}
          <DailyActivityChart month={month} year={year} refreshKey={refreshKey} />
        </TabsContent>

        {/* TAB: Ingresos */}
        <TabsContent value="income" className="space-y-6">
          {/* Ranking de categorías de ingresos */}
          <TopCategoriesRanking month={month} year={year} type="income" refreshKey={refreshKey} />
          
          {/* Lista completa */}
          <IncomeList month={month} year={year} refreshKey={refreshKey} />
        </TabsContent>

        {/* TAB: Gastos */}
        <TabsContent value="expenses" className="space-y-6">
          {/* Ranking de categorías de gastos */}
          <TopCategoriesRanking month={month} year={year} type="expense" refreshKey={refreshKey} />
          
          {/* Lista completa */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Gastos</CardTitle>
              <CardDescription>Todas tus salidas del mes</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionsList month={month} year={year} refreshKey={refreshKey} allowEdit={false} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Tendencias */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia Histórica</CardTitle>
              <CardDescription>Todos los meses con transacciones registradas</CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlyTrend refreshKey={refreshKey} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen del Mes Seleccionado</CardTitle>
              <CardDescription>Análisis detallado del período</CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardSummary month={month} year={year} refreshKey={refreshKey} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
