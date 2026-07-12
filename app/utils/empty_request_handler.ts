import { updateMedicalHistoriesValidator } from '#validators/medical_history/update_medical_histories_validator'
import { errors } from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

type UpdateMedicalHistoryType = Infer<typeof updateMedicalHistoriesValidator>

export function handlerEmptyRequest(data: Partial<UpdateMedicalHistoryType>) {
  if (Object.keys(data).length === 0) {
    throw new errors.E_VALIDATION_ERROR([
      { field: 'request_body', message: 'Debe ingresar al menos un cambio para actualizar' },
    ])
  }
}
