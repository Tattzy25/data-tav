export type DataType =
  | "text"
  | "number"
  | "email"
  | "date"
  | "boolean"
  | "phone"
  | "address"
  | "name"
  | "company"

export interface ColumnConfig {
  id: string
  name: string
  type: DataType
}
