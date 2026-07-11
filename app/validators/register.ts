import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim(),
    email: vine
      .string()
      .trim()
      .email()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user // Retorna true si el correo NO existe
      }),
    password: vine.string().minLength(8),
    branchId: vine.number().exists(async (db, value) => {
      const branch = await db.from('branches').where('id', value).first()
      return !!branch
    }),
    roleId: vine.number().exists(async (db, value) => {
      const role = await db.from('roles').where('id', value).first()
      return !!role
    }),
  })
)
