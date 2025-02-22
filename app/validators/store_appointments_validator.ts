import vine from '@vinejs/vine'
import { StatusAppintment } from '../enums/status_appointement.js'
import { DateTime } from 'luxon'

export const storeAppointmentsValidator = vine.compile(
  vine.object({
    patientId: vine.number(),
    userId: vine.number(),
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
