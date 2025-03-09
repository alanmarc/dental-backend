import Hospital from '#models/hospital'
import Branch from '#models/branch'
import User from '#models/user'
import Patient from '#models/patient'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'

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

    // Crear un usuario (admin)
    const adminUser = await User.create({
      fullName: 'El jefe tilin',
      email: 'admin@example.com',
      password: 'password',
      roleId: 1,
      branchId: branch.id,
    })

    await User.create({
      fullName: 'Dr Tilin',
      email: 'dr-tilin@example.com',
      password: 'password',
      roleId: 2,
      branchId: branch.id,
    })

    await User.create({
      fullName: 'Señorito Tilin',
      email: 'tilin@example.com',
      password: 'password',
      roleId: 3,
      branchId: branch.id,
    })

    // Crear un paciente
    await Patient.create({
      userId: adminUser.id,
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@example.com',
      dob: DateTime.fromISO('1990-05-15'),
      phone: '555-6789',
      address: 'Calle Secundaria #456',
      note: 'Paciente con antecedentes de hipertensión',
      branchId: branch.id,
    })

    console.log('Seeder ejecutado correctamente 🎉')
  }
}
