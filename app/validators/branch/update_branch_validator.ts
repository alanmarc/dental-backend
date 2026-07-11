import vine from '@vinejs/vine'

export const updateBranchValidator = vine.compile(
  vine.object({
    hospitalId: vine
      .number()
      .exists(async (db, value) => {
        const hospital = await db.from('hospitals').where('id', value).first()
        return !!hospital
      })
      .optional(),
    name: vine.string().trim().optional(),
    phone: vine.string().trim().optional(),
    email: vine.string().trim().email().optional(),
    address: vine.string().trim().optional(),
  })
)
