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
    updateOwn: 'patients.update.own',
    updateAny: 'patients.update.any',
    deleteOwn: 'patients.delete.own',
    deleteAny: 'patients.delete.any',
    restoreOwn: 'patients.restore.own',
    restoreAny: 'patients.restore.any',
  },
  appointments: {
    view: 'appointments.view',
    create: 'appointments.create',
    updateOwn: 'appointments.update.own',
    updateAny: 'appointments.update.any',
    deleteOwn: 'appointments.delete.own',
    deleteAny: 'appointments.delete.any',
    restoreOwn: 'appointments.restore.own',
    restoreAny: 'appointments.restore.any',
  },
  medicalHistories: {
    view: 'medical_histories.view',
    create: 'medical_histories.create',
    update: 'medical_histories.update',
  },
} as const
