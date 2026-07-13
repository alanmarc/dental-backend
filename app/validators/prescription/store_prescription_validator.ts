import vine from '@vinejs/vine'

export const storePrescriptionValidator = vine.compile(
  vine.object({
    userId: vine.number().exists(async (db, value) => {
      const user = await db
        .from('users')
        .join('roles', 'roles.id', 'users.role_id')
        .where('users.id', value)
        .where('roles.name', 'doctor')
        .first()
      return !!user
    }),
    patientId: vine.number().exists(async (db, value) => {
      const patient = await db.from('patients').where('id', value).whereNull('deleted_at').first()
      return !!patient
    }),
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
      .optional(),
    notes: vine.string().nullable().optional(),
    items: vine
      .array(
        vine.object({
          productId: vine
            .number()
            .exists(async (db, value) => {
              const product = await db
                .from('products')
                .where('id', value)
                .whereNull('deleted_at')
                .first()
              return !!product
            })
            .optional(),
          medicationName: vine.string().minLength(1),
          dosage: vine.string().minLength(1),
          frequency: vine.string().minLength(1),
          durationDays: vine.number().min(1),
          instructions: vine.string().nullable().optional(),
        })
      )
      .minLength(1),
  })
)
