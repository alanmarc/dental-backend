import vine from '@vinejs/vine'

export const storeHospitalValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
  })
)
