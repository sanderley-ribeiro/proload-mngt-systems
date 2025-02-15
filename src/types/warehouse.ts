
export interface WarehouseOccupation {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  floor: 'A' | 'B' | 'C';
  position_number: number;
  entry_date: string;
  stored_by: string | null;
}

export interface StockMovement {
  id: string;
  product_name: string;
  product_unit: string;
  movement_type: 'input' | 'output';
  quantity: number;
  movement_date: string;
  notes: string | null;
  floor: 'A' | 'B' | 'C' | null;
  position_number: number | null;
  created_by_name: string | null;
}
