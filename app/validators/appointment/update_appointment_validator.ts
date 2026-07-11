import vine from '@vinejs/vine'
import { DateTime } from 'luxon'
import { StatusAppointment } from '../../enums/status_appointement.js'

export const updateAppointmentValidator = vine.compile(
  vine.object({
    patientId: vine
      .number()
      .exists(async (db, value) => {
        const patient = await db.from('patients').where('id', value).first()
        return !!patient
      })
      .optional(),
    userId: vine
      .number()
      .exists(async (db, value) => {
        const user = await db.from('users').where('id', value).first()
        return !!user
      })
      .optional(),
    dateTime: vine
      .string()
      .transform((value) => {
        const dt = DateTime.fromISO(value)
        if (!dt.isValid) {
          throw new Error('Invalid date format')
        }
        return dt.toUTC()
      })
      .optional(),
    duration: vine.number().optional(),
    status: vine.enum(StatusAppointment).optional(),
    reason: vine.string().trim().optional(),
    note: vine.string().trim().optional(),
  })
)
