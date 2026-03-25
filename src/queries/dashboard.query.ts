import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { balancesResponseToCards } from "../adapters/balance.adapter"
import { balanceSnapshotsResponseToPoints } from "../adapters/balanceSnapshot.adapter"
import {
  getBalanceSnapshots,
  getCurrencyBalances,
  getStats,
} from "../services/dashboard.service"

const ONE_HOUR_MS = 60 * 60 * 1000
const SNAPSHOT_REFRESH_MINUTE = 2

const getUserLocalDateString = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, "0")
  const day = `${now.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: getStats,
  })
}

export const useDashboardCurrencyBalances = () => {
  return useQuery({
    queryKey: ["dashboard", "balances"],
    queryFn: async () => {
      const response = await getCurrencyBalances()
      return balancesResponseToCards(response)
    },
  })
}

export const useBalanceSnapshots = () => {
  const fecha = getUserLocalDateString()

  const query = useQuery({
    queryKey: ["dashboard", "balance-snapshots", fecha],
    queryFn: async () => {
      const response = await getBalanceSnapshots(fecha)
      return balanceSnapshotsResponseToPoints(response)
    },
    gcTime: ONE_HOUR_MS,
  })

  const { refetch } = query

  useEffect(() => {
    if (typeof window === "undefined") return

    let timeoutId: number | null = null
    let intervalId: number | null = null

    const scheduleNextRun = () => {
      const now = new Date()
      const next = new Date(now)
      next.setSeconds(0, 0)

      const minutePassed =
        now.getMinutes() > SNAPSHOT_REFRESH_MINUTE ||
        (now.getMinutes() === SNAPSHOT_REFRESH_MINUTE &&
          (now.getSeconds() > 0 || now.getMilliseconds() > 0))

      if (minutePassed) {
        next.setHours(next.getHours() + 1)
      }

      next.setMinutes(SNAPSHOT_REFRESH_MINUTE, 0, 0)
      const delay = next.getTime() - now.getTime()

      timeoutId = window.setTimeout(async () => {
        await refetch()
        intervalId = window.setInterval(() => {
          refetch()
        }, ONE_HOUR_MS)
      }, delay)
    }

    scheduleNextRun()

    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }
      if (intervalId !== null) {
        clearInterval(intervalId)
      }
    }
  }, [refetch])

  return query
}
