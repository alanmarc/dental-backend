import vine from '@vinejs/vine'

export const updatePrescriptionValidator = vine.compile(
  vine.object({
    userId: vine
      .number()
      .exists(async (db, value) => {
        const user = await db
          .from('users')
          .join('roles', 'roles.id', 'users.role_id')
          .where('users.id', value)
          .where('roles.name', 'doctor')
          .first()
        return !!user
      })
      .optional(),
    patientId: vine
      .number()
      .exists(async (db, value) => {
        const patient = await db.from('patients').where('id', value).whereNull('deleted_at').first()
        return !!patient
      })
      .optional(),
    appointmentId: vine
      .number()
      .exists(async (db, value) => {
        const appointment = await db
          .from('appointments')
          .where('id', value)
          .whereNull('deleted_at')
          .first()
        return !!appointment
      })
      .nullable()
      .optional(),
    medicalHistoryId: vine
      .number()
      .exists(async (db, value) => {
        const history = await db
          .from('medical_histories')
          .where('id', value)
          .whereNull('deleted_at')
          .first()
        return !!history
      })
      .nullable()
      .optional(),
    notes: vine.string().nullable().optional(),
  })
)
