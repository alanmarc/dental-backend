import vine from '@vinejs/vine'
import { StatusAppintment } from '../enums/status_appointement.js'
import { DateTime } from 'luxon'

export const storeAppointmentsValidator = vine.compile(
  vine.object({
    patientId: vine.number(),
    userId: vine.number(),
    dateTime: vine.string().transform((value) => {
      const dt = DateTime.fromISO(value) // Convierte el string en DateTime
      if (!dt.isValid) {
        throw new Error('Invalid date format')
      }
      return dt.toUTC() // Convertimos a UTC y lo devolvemos como un objeto DateTime
    }),
    duration: vine.number(),
    status: vine.enum(StatusAppintment),
    reason: vine.string(),
  })
)
