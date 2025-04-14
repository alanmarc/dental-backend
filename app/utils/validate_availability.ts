import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

export async function isAppointmentAvailable(
  branchId: number,
  start: DateTime,
  duration: number
): Promise<boolean> {
  const end = start.plus({ minutes: duration })

  // Asegurarnos de que los valores SQL no sean nulos
  const startSQL = start.toSQL()
  const endSQL = end.toSQL()

  if (!startSQL || !endSQL) {
    throw new Error('Fecha inválida para la consulta SQL')
  }

  const overlapping = await db
    .from('appointments')
    .where('branch_id', branchId)
    .andWhereRaw(`date_time < ? AND (date_time + make_interval(mins => duration)) > ?`, [
      endSQL,
      startSQL,
    ])
    .whereNull('deleted_at')
    .first()

  return !overlapping
}
