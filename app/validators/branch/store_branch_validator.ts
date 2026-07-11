import vine from '@vinejs/vine'

export const storeBranchValidator = vine.compile(
  vine.object({
    hospitalId: vine.number().exists(async (db, value) => {
      const hospital = await db.from('hospitals').where('id', value).first()
      return !!hospital
    }),
    name: vine.string().trim(),
    phone: vine.string().trim(),
    email: vine.string().trim().email(),
    address: vine.string().trim(),
  })
)
