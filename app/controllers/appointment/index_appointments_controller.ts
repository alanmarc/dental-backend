import Appointment from '#models/appointment'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import AppointmentPolicy from '#policies/appointment_policy'
import { handleControllerError } from '../../utils/error_handler.js'

import { getBranchIdsForActorHospital } from '../../services/scope_service.js'

export default class IndexAppointmentsController {
  public async handle(ctx: HttpContext) {
    try {
      await ctx.bouncer.with(AppointmentPolicy).authorize('view')

      const page = ctx.request.input('page', 1)
      const limit = ctx.request.input('limit', 10)
      const status = ctx.request.input('status', undefined)
      const actor = ctx.auth.user!

      // Inicia la consulta
      const query = Appointment.query()

      // Aplica el filtro si existe
      if (status) {
        query.where('status', status)
      }

      // Enforce hospital scoping
      if (!actor.hasPermission('appointments.view.any')) {
        const branchIds = await getBranchIdsForActorHospital(actor)
        query.whereIn('branch_id', branchIds)
      }

      // Ejecuta la consulta CON los filtros aplicados
      const appointments = await query.paginate(page, limit)

      // Carga las relaciones de forma secuencial para evitar advertencias de pg concurrente
      for (const appointment of appointments) {
        await appointment.load('patient')
        await appointment.load('user')
        await appointment.load('branch')
      }

      return ApiResponse.paginate(
        ctx,
        appointments.toJSON().data,
        appointments.toJSON().meta,
        'Citas encontradas'
      )
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
