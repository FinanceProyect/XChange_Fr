import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

// Acceso a la MySQL de pruebas vía `docker exec`. Solo para sembrar datos y verificar saldos/filas.
const CONTAINER = process.env.CYP_MYSQL_CONTAINER ?? 'cyp-test-mysql'
export const CYP_DB = process.env.CYP_DB ?? 'cambio_joyas_prueba_db'

function mysql(args: string[], input?: Buffer | string): string {
  return execFileSync(
    'docker',
    ['exec', ...(input !== undefined ? ['-i'] : []), CONTAINER, 'mysql', '-uroot', '-proot', '-N', '-B', ...args],
    { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
  ).trim()
}

export function sql(query: string, db: string = CYP_DB): string {
  return mysql([db, '-e', query])
}

export function sqlFile(path: string, db: string) {
  mysql([db], readFileSync(path))
}

export function getSaldo(activo: string): number {
  return Number(sql(`SELECT saldo FROM balance WHERE activo = '${activo}'`))
}

export function setSaldo(activo: string, saldo: number) {
  sql(`UPDATE balance SET saldo = ${saldo} WHERE activo = '${activo}'`)
}

/** Estado conocido antes de cada prueba: divisas con saldo holgado, ARS/PTRANS en cero, sin intercambios. */
export function resetEstado() {
  sql(`DELETE FROM intercambios`)
  for (const a of ['USD', 'EUR', 'BRL', 'USDT']) setSaldo(a, 100000)
  for (const a of ['ARS', 'PTRANS']) setSaldo(a, 0)
}

export function contarIntercambios(): number {
  return Number(sql(`SELECT COUNT(*) FROM intercambios`))
}
