import { test, expect } from '@playwright/test'
import { resolve } from 'node:path'
import { sql, sqlFile } from '../support/db'

// Ejecuta el archivo V5 real contra una base con intercambios guardados en la convención anterior.
// Cubre specs/intercambio-divisas: "Migración de la cotización de intercambios históricos".

const MIG_DB = 'mig_cotizacion_test'
const BACKEND_MIGRATIONS = resolve(process.cwd(), '../Backend/CambioJoyasLourdes/src/main/resources/db/migration')
const V1 = resolve(BACKEND_MIGRATIONS, 'V1__esquema_inicial.sql')
const V5 = resolve(BACKEND_MIGRATIONS, 'V5__cotizacion_usd_base.sql')

// Convención anterior: tasa = USD por 1 unidad no-USD. monto_salida ya guardado con esa convención.
const HISTORICO = [
  { id: 'mig-1', entrada: 'USD', montoEntrada: 117, salida: 'EUR', montoSalida: 100, tasaVieja: '1.1700', tasaNueva: 0.85470085 },
  { id: 'mig-2', entrada: 'EUR', montoEntrada: 100, salida: 'USD', montoSalida: 114, tasaVieja: '1.1400', tasaNueva: 0.87719298 },
  { id: 'mig-3', entrada: 'USD', montoEntrada: 200, salida: 'EUR', montoSalida: 170, tasaVieja: '1.1700', tasaNueva: 0.85470085 },
  { id: 'mig-4', entrada: 'BRL', montoEntrada: 5500, salida: 'USD', montoSalida: 999, tasaVieja: '0.1818', tasaNueva: 5.50055006 },
  { id: 'mig-5', entrada: 'EUR', montoEntrada: 0, salida: 'USD', montoSalida: 0, tasaVieja: '0.0000', tasaNueva: 0 },
]

test.describe.serial('migración V5: cotización USD como moneda base', () => {
  test.beforeAll(() => {
    sql(`DROP DATABASE IF EXISTS ${MIG_DB}`, 'cambio_joyas_prueba_db')
    sql(`CREATE DATABASE ${MIG_DB}`, 'cambio_joyas_prueba_db')
    sqlFile(V1, MIG_DB) // esquema base: crea intercambios con tasa_cambio DECIMAL(10,4)
    for (const h of HISTORICO) {
      sql(
        `INSERT INTO intercambios (id, activo_entrada, activo_salida, fecha_hora, monto_entrada, monto_salida, tasa_cambio)
         VALUES ('${h.id}', '${h.entrada}', '${h.salida}', NOW(6), ${h.montoEntrada}, ${h.montoSalida}, ${h.tasaVieja})`,
        MIG_DB,
      )
    }
    sqlFile(V5, MIG_DB)
  })

  test.afterAll(() => {
    sql(`DROP DATABASE IF EXISTS ${MIG_DB}`, 'cambio_joyas_prueba_db')
  })

  const leerTasas = () =>
    sql(`SELECT id, tasa_cambio FROM intercambios ORDER BY id`, MIG_DB)
      .split('\n')
      .map(l => l.split('\t'))
      .reduce<Record<string, number>>((acc, [id, t]) => ({ ...acc, [id]: Number(t) }), {})

  test('la columna pasa a DECIMAL(18,8)', () => {
    const tipo = sql(
      `SELECT COLUMN_TYPE FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = '${MIG_DB}' AND TABLE_NAME = 'intercambios' AND COLUMN_NAME = 'tasa_cambio'`,
      MIG_DB,
    )
    expect(tipo).toBe('decimal(18,8)')
  })

  test('cada cotización queda invertida: nueva = ROUND(1 / vieja, 8)', () => {
    const tasas = leerTasas()
    for (const h of HISTORICO) {
      expect(tasas[h.id], h.id).toBeCloseTo(h.tasaNueva, 8)
    }
  })

  test('el respaldo conserva exactamente las cotizaciones originales', () => {
    const backup = sql(`SELECT id, tasa_cambio FROM intercambios_tasa_backup_v5 ORDER BY id`, MIG_DB)
      .split('\n')
      .map(l => l.split('\t'))
    expect(backup.length).toBe(HISTORICO.length)
    for (const h of HISTORICO) {
      const fila = backup.find(([id]) => id === h.id)
      expect(fila, h.id).toBeDefined()
      expect(Number(fila![1]), h.id).toBeCloseTo(Number(h.tasaVieja), 4)
    }
  })

  test('monto_salida y monto_entrada no cambian (los balances ya usaron esos valores)', () => {
    for (const h of HISTORICO) {
      const [salida, entrada] = sql(
        `SELECT monto_salida, monto_entrada FROM intercambios WHERE id = '${h.id}'`,
        MIG_DB,
      ).split('\t').map(Number)
      expect(salida, `${h.id} monto_salida`).toBe(h.montoSalida)
      expect(entrada, `${h.id} monto_entrada`).toBe(h.montoEntrada)
    }
  })

  test('cero filas afectadas: una cotización 0 queda intacta, sin error de división', () => {
    expect(leerTasas()['mig-5']).toBe(0)
  })

  test('la cantidad de intercambios coincide con el respaldo', () => {
    expect(Number(sql(`SELECT COUNT(*) FROM intercambios`, MIG_DB)))
      .toBe(Number(sql(`SELECT COUNT(*) FROM intercambios_tasa_backup_v5`, MIG_DB)))
  })

  test('la reversión desde el respaldo restaura las cotizaciones originales', () => {
    sql(
      `UPDATE intercambios i JOIN intercambios_tasa_backup_v5 b ON b.id = i.id SET i.tasa_cambio = b.tasa_cambio`,
      MIG_DB,
    )
    const tasas = leerTasas()
    for (const h of HISTORICO) {
      expect(tasas[h.id], h.id).toBeCloseTo(Number(h.tasaVieja), 4)
    }
  })
})
