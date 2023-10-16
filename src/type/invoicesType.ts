import dayjs from "dayjs"

export interface Invoices {
  idEdit?: number | null,
  departmentProcess?: any,
  address?: string,
  code?: string,
  provider?: string,
  symbol?: string,
  tax_code?: string,
  type?: string,
  invoice_date?: string,
  id?: number,
  payment_type?: number,
  total_amount?: number,
  total_fee?: number,
  total_final_amount?: number,
  total_vat_amount?: number,
  invoice_files?: any,
  invoice_items?: any,
  invoice_item?: any
}