import { on } from "events";
import { api } from "./api";
import { TableDatabaseResponse, SelectedTables, DbConnectorInfo } from "@/schema/ingestion";

type ProgressCallback = (progress: number) => void;

/**
 * Format response data untuk ditampilkan ke user
 */
function formatIngestionResponse(data: any): string {
  try {
    // Jika data adalah string, parse dulu
    let parsedData = data;
    if (typeof data === "string") {
      try {
        parsedData = JSON.parse(data);
      } catch (parseError) {
        // Jika gagal parse, return as is tapi batasi panjangnya
        return data.length > 200 ? data.substring(0, 200) + "..." : data;
      }
    }

    if (parsedData && typeof parsedData === "object") {
      let message = "Data berhasil di-ingest!\n\n";

      // Untuk unstructured data (file upload)
      if (parsedData.filename) {
        message += `File: ${parsedData.filename}\n`;
        if (parsedData.raw_chunks_count !== undefined) {
          message += `Raw chunks: ${parsedData.raw_chunks_count}\n`;
        }
        if (parsedData.processed_chunks_count !== undefined) {
          message += `Processed chunks: ${parsedData.processed_chunks_count}\n`;
        }
        if (parsedData.total_embedded_chunks !== undefined) {
          message += `Embedded chunks: ${parsedData.total_embedded_chunks}\n`;
        }
      }

      // Untuk structured data (database)
      if (parsedData.chunks && typeof parsedData.chunks === "object") {
        const tables = Object.keys(parsedData.chunks);
        message += `Tables processed: ${tables.length}\n`;

        let totalChunks = 0;
        tables.forEach(table => {
          const chunks = parsedData.chunks[table];
          if (Array.isArray(chunks)) {
            totalChunks += chunks.length;
            message += `  • ${table}: ${chunks.length} chunks\n`;
          }
        });

        message += `\nTotal chunks embedded: ${totalChunks}`;
      }

      // Info Milvus
      if (parsedData.milvus_result || parsedData.milvus_insertion) {
        const milvusData = parsedData.milvus_result || parsedData.milvus_insertion;
        if (milvusData.status === "success") {
          message += `\n\nData tersimpan di vector database`;
        } else if (milvusData.status === "error") {
          message += `\n\nAda masalah saat menyimpan ke vector database`;
        }
      }

      return message;
    }

    // Fallback jika format tidak dikenali
    return "Data berhasil di-ingest!";

  } catch (error) {
    console.error("Error formatting response:", error);
    return "Data berhasil di-ingest!";
  }
}

/**
 * Ingest structured data file
 */
export async function ingestStructuredFile(
  files: (File | null)[],
  chatbotId: string,
  selectedTables: SelectedTables ,
  onProgress?: ProgressCallback
): Promise<string> {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      if (file) {
        formData.append('file', file); // Same field name for all files
      }
    });
    formData.append("chatbot_id", chatbotId);
    console.log("Selected Tables for Ingestion:", JSON.stringify(selectedTables));
    formData.append("selected_tables", JSON.stringify(selectedTables));

    // Set progress untuk processing phase
    onProgress?.(50);

    const response = await api.post("/ingest/structured/file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          // Progress upload: 0-50%
          const uploadProgress = Math.round((progressEvent.loaded * 50) / progressEvent.total);
          onProgress?.(uploadProgress);
          
          // Jika upload selesai, set ke 50% dan tunggu backend processing
          if (progressEvent.loaded === progressEvent.total) {
            onProgress?.(50);
          }
        }
      },
    });

    // Backend processing selesai, set ke 100%
    onProgress?.(100);

    // Format response untuk user-friendly display
    return formatIngestionResponse(response.data);
  } catch (error) {
    throw error;
  }
}

/**
 * Ingest unstructured data file
 */
export async function ingestUnstructuredFile(
  files: (File | null)[],
  chatbotId: string,
  onProgress?: ProgressCallback
): Promise<string> {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      if (file) {
        formData.append('file', file); // Same field name for all files
      }
    });
    formData.append("chatbot_id", chatbotId);

    // Set progress untuk processing phase
    onProgress?.(50);

    const response = await api.post("/ingest/unstructured", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          // Progress upload: 0-50%
          const uploadProgress = Math.round((progressEvent.loaded * 50) / progressEvent.total);
          onProgress?.(uploadProgress);
          
          // Jika upload selesai, set ke 50% dan tunggu backend processing
          if (progressEvent.loaded === progressEvent.total) {
            onProgress?.(50);
          }
        }
      },
    });

    // Backend processing selesai, set ke 100%
    onProgress?.(100);

    // Format response untuk user-friendly display
    return formatIngestionResponse(response.data);
  } catch (error) {
    throw error;
  }
}

export async function ingestStructuredDb(
  dbconnector_data: DbConnectorInfo,
  chatbotId: string,
  selected_tables: string[],
  onProgress?: ProgressCallback
): Promise<string> {
  try {
    const payload = {
      chatbot_id: chatbotId,
      name: dbconnector_data.name,
      type: dbconnector_data.type,
      host: dbconnector_data.host,
      port: dbconnector_data.port,
      database: dbconnector_data.database,
      username: dbconnector_data.username,
      password: dbconnector_data.password,
      selected_tables: selected_tables, // ⬅️ ARRAY ASLI
    };

    onProgress?.(50);

    const response = await api.post(
      "/ingest/structured",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return formatIngestionResponse(response.data);
  } catch (error) {
    throw error;
  }finally {
    onProgress?.(100);
  }
}

export async function previewTableSqlFile(
  files: (File | null)[],
  onProgress?: ProgressCallback
): Promise<TableDatabaseResponse> {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      if (file) {
        formData.append('file', file); // Same field name for all files
      }
    });

    // Set progress untuk processing phase
    onProgress?.(50);

    const response = await api.post("/ingest/files/preview-tables", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          // Progress upload: 0-50%
          const uploadProgress = Math.round((progressEvent.loaded * 50) / progressEvent.total);
          onProgress?.(uploadProgress);
          
          // Jika upload selesai, set ke 50% dan tunggu backend processing
          if (progressEvent.loaded === progressEvent.total) {
            onProgress?.(50);
          }
        }
      },
    });

    // Backend processing selesai, set ke 100%
    onProgress?.(100);

    // Format response untuk user-friendly display
    return response.data as TableDatabaseResponse;
  } catch (error) {
    throw error;
  }
}


export async function previewTableSql(
  dbconnector_data: DbConnectorInfo
): Promise<TableDatabaseResponse> {
  try {
    const formData = new FormData();
    formData.append("name", dbconnector_data.name);
    formData.append("type", dbconnector_data.type);
    formData.append("host", dbconnector_data.host);
    formData.append("port", String(dbconnector_data.port));
    formData.append("database", dbconnector_data.database);
    formData.append("username", dbconnector_data.username);
    formData.append("password", dbconnector_data.password);

    
    const response = await api.post("/ingest/database/tables", formData, {
    headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data as TableDatabaseResponse;
  } catch (error) {
    throw error;
  }
}

export async function ingestOpenApI(
  openapi_url: string,
  chatbotId: string,
  headers?: Record<string, string>,
  onProgress?: ProgressCallback
): Promise<string> {
  try {
    const payload = {
      url: openapi_url,        // ⬅️ FIX
      chatbot_id: chatbotId,
      headers: headers || {},
    };
    onProgress?.(50);
    const response = await api.post("/ingest/open-api/url", payload);
    return formatIngestionResponse(response.data);

  } catch (error) {
    throw error;
  }finally {
    onProgress?.(100);
  }
}
