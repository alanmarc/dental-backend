import vine from '@vinejs/vine'

export const updateHospitalValidator = vine.compile(
  vine.object({
    name: vine.string().trim().optional(),
  })
)
