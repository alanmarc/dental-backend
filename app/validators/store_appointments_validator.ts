import vine from '@vinejs/vine'
import { StatusAppintment } from '../enums/status_appointement.js'
import { DateTime } from 'luxon'

export const storeAppointmentsValidator = vine.compile(
  vine.object({
    userId: vine.number().exists(async (db, value) => {
      const user = await db.from('users').where('id', value).first()
      return !!user
    }),
    patientId: vine.number().exists(async (db, value) => {
      const patient = await db.from('patients').where('id', value).first()
      return !!patient
    }),
    dateTime: vine.string().transform((value) => {
      const dt = DateTime.fromISO(value)
      if (!dt.isValid) {
        throw new Error('Invalid date format')
      }
      return dt.toUTC()
    }),
    duration: vine.number(),
    status: vine.enum(StatusAppintment),
    reason: vine.string(),
  })
)
