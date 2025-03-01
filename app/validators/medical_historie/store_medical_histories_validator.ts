import vine from '@vinejs/vine'

export const storeMedicalHistoriesValidator = vine.compile(
  vine.object({
    userId: vine.number().exists(async (db, value) => {
      const user = await db.from('users').where('id', value).first()
      return !!user
    }),
    patientId: vine.number().exists(async (db, value) => {
      const patient = await db.from('patients').where('id', value).first()
      return !!patient
    }),
    appointmentId: vine.number().exists(async (db, value) => {
      const appointment = await db.from('appointments').where('id', value).first()
      return !!appointment
    }),
    diagnosis: vine.string(),
    treatment: vine.string(),
    notes: vine.string().optional(),
  })
)
