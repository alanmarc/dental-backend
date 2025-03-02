import vine from '@vinejs/vine'

export const updateMedicalHistoriesValidator = vine.compile(
  vine.object({
    userId: vine
      .number()
      .exists(async (db, value) => {
        const user = await db.from('users').where('id', value).first()
        return !!user
      })
      .optional(),
    appointmentId: vine
      .number()
      .exists(async (db, value) => {
        const appointment = await db.from('appointments').where('id', value).first()
        return !!appointment
      })
      .optional(),
    diagnosis: vine.string().optional(),
    treatment: vine.string().optional(),
    notes: vine.string().optional(),
  })
)
