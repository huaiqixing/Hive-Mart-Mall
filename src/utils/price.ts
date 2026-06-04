/** 将分转换为元，保留两位小数 */
export function fenToYuan(price: number | undefined | null): string {
  if (price == null) return '0.00'
  return (price / 100).toFixed(2)
}
