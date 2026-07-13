import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Inventory from '#models/inventory'
import Product from '#models/product'
import InventoryMovement from '#models/inventory_movement'
import InsufficientStockException from '#exceptions/insufficient_stock_exception'

export type MovementType =
  | 'purchase'
  | 'purchase_return'
  | 'adjustment_in'
  | 'adjustment_out'
  | 'consumption'
  | 'patient_return'
  | 'transfer_out'
  | 'transfer_in'

export async function registerMovement(params: {
  branchId: number
  productId: number
  type: MovementType
  quantity: number
  direction: 'in' | 'out'
  userId: number
  purchaseId?: number
  transferId?: number
  appointmentId?: number
  prescriptionId?: number
  prescriptionItemId?: number
  notes?: string
  trx: TransactionClientContract
}): Promise<{ movement: InventoryMovement; inventory: Inventory }> {
  const {
    branchId,
    productId,
    type,
    quantity,
    direction,
    userId,
    purchaseId,
    transferId,
    appointmentId,
    prescriptionId,
    prescriptionItemId,
    notes,
    trx,
  } = params

  // 1. Busca la fila de Inventory para (branchId, productId) usando forUpdate para lockear la fila
  let inventory = await Inventory.query({ client: trx })
    .where('branch_id', branchId)
    .where('product_id', productId)
    .forUpdate()
    .first()

  // 2. Si no existe, lo crea con cantidad 0
  if (!inventory) {
    inventory = await Inventory.create(
      {
        branchId,
        productId,
        quantity: 0,
      },
      { client: trx }
    )

    // Recargar con forUpdate para bloquearlo
    inventory = await Inventory.query({ client: trx })
      .where('id', inventory.id)
      .forUpdate()
      .firstOrFail()
  }

  // 3. Calcula el nuevo saldo
  const change = direction === 'in' ? quantity : -quantity
  const newQuantity = inventory.quantity + change

  // 4. Si es salida y el saldo final es menor a 0, valida allowsNegativeStock
  if (direction === 'out' && newQuantity < 0) {
    const product = await Product.findOrFail(productId, { client: trx })
    if (!product.allowsNegativeStock) {
      throw new InsufficientStockException('Stock insuficiente')
    }
  }

  // 5. Actualiza Inventory.quantity al nuevo saldo
  inventory.quantity = newQuantity
  await inventory.save()

  // 6. Inserta la fila en InventoryMovement
  const movement = await InventoryMovement.create(
    {
      branchId,
      productId,
      type,
      quantity,
      purchaseId,
      transferId,
      appointmentId,
      prescriptionId,
      prescriptionItemId,
      userId,
      notes,
    },
    { client: trx }
  )

  return { movement, inventory }
}
