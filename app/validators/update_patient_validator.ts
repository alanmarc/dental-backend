import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export const updatePatientValidator = vine.compile(
  vine.object({
    userId: vine
      .number()
      .exists(async (db, value) => {
        const user = await db.from('users').where('id', value).first()
        return !!user
      })
      .optional(),
    firstName: vine.string().trim().optional(),
    lastName: vine.string().trim().optional(),
    email: vine
      .string()
      .trim()
      .email()
      .unique(async (db, value) => {
        const patient = await db.from('patients').where('email', value).first()
        return !patient
      })
      .optional(),
    dob: vine
      .string()
      .transform((value) => {
        const dt = DateTime.fromISO(value)
        if (!dt.isValid) {
          throw new Error('Invalid date format')
        }
        return dt.toUTC()
      })
      .optional(),
    phone: vine.string().trim().optional(),
    address: vine.string().trim().optional(),
    note: vine.string().trim().optional(),
  })
)
