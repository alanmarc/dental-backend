import { HttpContext } from '@adonisjs/core/http'

export default class ApiResponse {
  public static success(
    ctx: HttpContext,
    data: any,
    message: string = 'Success',
    status: number = 200
  ) {
    return ctx.response.status(status).json({
      status: 'success',
      message,
      data,
    })
  }

  public static error(ctx: HttpContext, message: string, code: number, details: any = null) {
    return ctx.response.status(code).json({
      status: 'error',
      message,
      code,
      details,
    })
  }

  public static paginate(
    ctx: HttpContext,
    data: any,
    pagination: any,
    message: string = 'Success'
  ) {
    return ctx.response.status(200).json({
      status: 'success',
      message,
      data,
      meta: {
        pagination,
      },
    })
  }
}
