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
  })
)

// Mensajes personalizados (opcional)
registerValidator.messages = {
  'fullName.required': 'El nombre completo es obligatorio',
  'email.required': 'El correo es obligatorio',
  'email.email': 'El correo no es válido',
  'email.unique': 'El correo ya está en uso',
  'password.required': 'La contraseña es obligatoria',
  'password.minLength': 'La contraseña debe tener al menos 8 caracteres',
}
