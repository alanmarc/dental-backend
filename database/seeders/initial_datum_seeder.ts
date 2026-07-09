import Hospital from '#models/hospital'
import Branch from '#models/branch'
import User from '#models/user'
import Patient from '#models/patient'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Role from '#models/role'

export default class InitialDataSeeder extends BaseSeeder {
  public async run() {
    // Verificar si ya existen hospitales
    const existingHospitals = await Hospital.query().count('* as total')
    const totalHospitals = existingHospitals[0]?.$extras.total ?? 0

    if (totalHospitals > 0) {
      console.log('Los hospitales ya están registrados. Seeder omitido.')
      return
    }

    // Crear un hospital
    const hospital = await Hospital.create({
      name: 'Hospital Tilines',
    })

    // Crear una sucursal
    const branch = await Branch.create({
      hospitalId: hospital.id,
      name: 'Sucursal Principal',
      phone: '555-1234',
      email: 'contacto@sucursal.com',
      address: 'Av. Principal #123. Puebla, Puebla México',
    })

    const [adminRole, doctorRole, assistantRole] = await Promise.all([
      Role.findByOrFail('name', 'admin'),
      Role.findByOrFail('name', 'doctor'),
      Role.findByOrFail('name', 'assistant'),
    ])

    await User.create({
      fullName: 'El jefe tilin',
      email: 'admin@example.com',
      password: 'password',
      roleId: adminRole.id,
      branchId: branch.id,
    })

    const doctorUser = await User.create({
      fullName: 'Dr Tilin',
      email: 'dr-tilin@example.com',
      password: 'password',
      roleId: doctorRole.id,
      branchId: branch.id,
    })

    await User.create({
      fullName: 'Señorito Tilin',
      email: 'tilin@example.com',
      password: 'password',
      roleId: assistantRole.id,
      branchId: branch.id,
    })

    await Patient.create({
      userId: doctorUser.id,
      firstName: 'Tilin',
      lastName: 'Marcos',
      email: 'tilin.marcos@example.com',
      dob: DateTime.fromISO('1990-05-15'),
      phone: '555-6789',
      address: 'Calle Secundaria #456',
      note: 'Paciente con antecedentes de hipertensión',
      branchId: branch.id,
    })

    console.log('Seeder ejecutado correctamente 🎉')
  }
}
