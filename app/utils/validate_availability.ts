import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

export async function isAppointmentAvailable(
  userId: number,
  start: DateTime,
  duration: number,
  excludeId?: number
): Promise<boolean> {
  const end = start.plus({ minutes: duration })

  // Asegurarnos de que los valores SQL no sean nulos
  const startSQL = start.toSQL()
  const endSQL = end.toSQL()

  if (!startSQL || !endSQL) {
    throw new Error('Fecha inválida para la consulta SQL')
  }

  const query = db
    .from('appointments')
    .where('user_id', userId)
    .andWhereRaw(`date_time < ? AND (date_time + make_interval(mins => duration)) > ?`, [
      endSQL,
      startSQL,
    ])
    .whereNull('deleted_at')

  if (excludeId) {
    query.whereNot('id', excludeId)
  }

  const overlapping = await query.first()

  return !overlapping
}
