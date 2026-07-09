// app/constants/permissions.ts
export const PERMISSIONS = {
  users: {
    view: 'users.view',
    create: 'users.create',
    update: 'users.update',
    delete: 'users.delete',
    restore: 'users.restore',
    assignRole: 'users.assign_role',
  },
  patients: {
    view: 'patients.view',
    create: 'patients.create',
    update: 'patients.update',
    delete: 'patients.delete',
    restore: 'patients.restore',
  },
  appointments: {
    view: 'appointments.view',
    create: 'appointments.create',
    update: 'appointments.update',
    cancel: 'appointments.cancel',
  },
  medicalHistories: {
    view: 'medical_histories.view',
    create: 'medical_histories.create',
    update: 'medical_histories.update',
  },
} as const
