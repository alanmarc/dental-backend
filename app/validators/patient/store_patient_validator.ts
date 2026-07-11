import vine from '@vinejs/vine'

export const storePatientValidator = vine.compile(
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
    firstName: vine.string().trim(),
    lastName: vine.string().trim(),
    email: vine.string().email().optional(),
    dob: vine.date().optional(),
    phone: vine.string().optional(),
    address: vine.string().optional(),
    note: vine.string().optional(),
  })
)
