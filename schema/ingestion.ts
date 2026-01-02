export interface ColumnSchema {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
}

export interface TableSchema {
  table_name: string;
  row_count: number;
  columns: ColumnSchema[];
}

export interface TableDatabaseResponse {
  status: "success" | "error";
  filename: string;
  total_tables: number;
  tables: TableSchema[];
}

export interface FileTableSelection {
  file: File | null;
  isAllTables: boolean;
  availableTables: string[];
  selectedTables: string[];
  isLoadingTables: boolean;
  tableStatus?: "success" | "failed"; // Status dari retrieve
  errorMessage?: string; // Error message jika gagal
}

export interface SelectedTables {
  [fileName: string]: string[];
}


export interface DbConnectorInfo {
  type: string;
  name: string;
  host: string;
  port: number | string;
  database: string;
  username: string;
  password: string;
}


