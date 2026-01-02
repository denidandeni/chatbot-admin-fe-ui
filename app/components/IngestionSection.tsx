"use client";

import { useState, useEffect } from "react";
import {
  ingestStructuredFile,
  ingestUnstructuredFile,
  previewTableSqlFile,
  previewTableSql,
  ingestOpenApI,
  ingestStructuredDb
} from "@/services/ingestion";
import { SelectedTables } from "@/schema/ingestion";

interface IngestionSectionProps {
  chatbotId: string;
  onIngestionComplete?: () => void;
}

interface ConnectorData {
  type: string;
  name: string;
  host: string;
  port: number | string;
  database: string;
  username: string;
  password: string;
}

interface IngestionHistory {
  id: string;
  filename: string;
  type: "structured" | "unstructured" | "connector";
  source: string;
  status: "success" | "failed";
  created_at: string;
}

// Tambahan: interface untuk tracking per file
interface FileTableSelection {
  file: File | null;
  mode: "all" | "select"; // all tables or select specific
  availableTables: string[];
  selectedTables: string[];
}

interface ConnectorTableSelection {
  connector: ConnectorData;
  mode: "all" | "select"; // all tables or select specific
  availableTables: string[];
  selectedTables: string[];
}

interface OpenApiData {
  url: string;
  headers: Record<string, string>;
}

export default function IngestionSection({
  chatbotId,
  onIngestionComplete,
}: IngestionSectionProps) {
  // Ubah state management untuk handle per-file selection
  const [fileSelections, setFileSelections] = useState<FileTableSelection[]>([
    {
      file: null,
      mode: "all",
      availableTables: [],
      selectedTables: [],
    },
  ]);

  const [connectorTableSelection, setConnectorTableSelection] =
    useState<ConnectorTableSelection>({
      connector: {
        type: "postgresql",
        name: "",
        host: "",
        port: 5432,
        database: "",
        username: "",
        password: "",
      },
      mode: "all",
      availableTables: [],
      selectedTables: [],
    });
  
  const [OpenApiData, setOpenApiData] = useState<OpenApiData>({
    url: "",
    headers: {Authorization: "Bearer your_token"},
  });
  const [openApiHeadersText, setOpenApiHeadersText] = useState<string>("");

  const [ingestionType, setIngestionType] = useState<
    "structured" | "unstructured"
  >("structured");
  const [sourceType, setSourceType] = useState<"file" | "connector" | "openapi">("file");
  const [connectorData, setConnectorData] = useState<ConnectorData>({
    type: "postgresql",
    name: "",
    host: "",
    port: 5432,
    database: "",
    username: "",
    password: "",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [ingestionHistory, setIngestionHistory] = useState<IngestionHistory[]>(
    []
  );
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    setOpenApiHeadersText(
      JSON.stringify(OpenApiData.headers, null, 2)
    );
  }, [OpenApiData.headers]);

  // Add new file field
  const addFileField = () => {
    setFileSelections([
      ...fileSelections,
      {
        file: null,
        mode: "all",
        availableTables: [],
        selectedTables: [],
      },
    ]);
  };

  // Remove file field
  const removeFileField = (index: number) => {
    const newSelections = fileSelections.filter((_, i) => i !== index);
    setFileSelections(
      newSelections.length > 0
        ? newSelections
        : [
            {
              file: null,
              mode: "all",
              availableTables: [],
              selectedTables: [],
            },
          ]
    );
  };

  // Handle file change untuk specific index
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const newSelections = [...fileSelections];
      newSelections[index] = {
        ...newSelections[index],
        file: file,
      };
      setFileSelections(newSelections);
    }
  };

  // Handle mode change per file (all vs select)
  const handleModeChange = (index: number, mode: "all" | "select") => {
    const newSelections = [...fileSelections];
    newSelections[index] = {
      ...newSelections[index],
      mode: mode,
      selectedTables: [], // Reset selection when mode changes
    };
    setFileSelections(newSelections);
  };

  const handleConnectorModeChange = (mode: "all" | "select") => {
    setConnectorTableSelection({
      ...connectorTableSelection,
      mode: mode,
      selectedTables: [], // Reset selection when mode changes
    });
  };

  // Retrieve tables untuk file tertentu
  const retrieveTablesForFile = async (index: number) => {
    const fileSelection = fileSelections[index];
    if (!fileSelection.file) {
      setUploadError(`Please select a SQL file first for field ${index + 1}.`);
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      setUploadMessage("");

      // Call API dengan single file
      const response = await previewTableSqlFile([fileSelection.file]);
      console.log("Preview Table Response:", response);
      const tables = response.tables.map((table) => table.table_name) || [];

      // Update state untuk file ini
      const newSelections = [...fileSelections];
      newSelections[index] = {
        ...newSelections[index],
        availableTables: tables,
      };
      setFileSelections(newSelections);

      setUploadMessage(
        `Tables retrieved successfully for ${fileSelection.file.name}. You can now select the tables to ingest.`
      );
    } catch (error) {
      setUploadError(
        `Failed to retrieve tables for ${
          fileSelection.file.name
        }. Please ensure the file is a valid SQL file. : ${
          (error as Error).message
        }`
      );
    } finally {
      setUploading(false);
    }
  };

  const retrieveTablesForConnector = async () => {
    try {
      setUploading(true);
      setUploadError("");
      setUploadMessage("");
      // Call API dengan connector data
      const response = await previewTableSql(connectorData);
      console.log("Preview Table Response:", response);
      const tables = response.tables.map((table) => table.table_name) || [];
      setConnectorTableSelection({
        ...connectorTableSelection,
        availableTables: tables,
      });
      setUploadMessage(
        `Tables retrieved successfully for connector. You can now select the tables to ingest.`
      );
    } catch (error) {
      setUploadError(
        `Failed to retrieve tables for connector. Please ensure the connection details are correct. : ${
          (error as Error).message
        }`
      );
    } finally {
      setUploading(false);
    }
  };

  // Handle table toggle per file
  const handleTableToggle = (index: number, tableName: string) => {
    const newSelections = [...fileSelections];
    const currentSelected = newSelections[index].selectedTables;

    newSelections[index].selectedTables = currentSelected.includes(tableName)
      ? currentSelected.filter((t) => t !== tableName)
      : [...currentSelected, tableName];

    setFileSelections(newSelections);
  };

  const handleConnectorTableToggle = (tableName: string) => {
    const currentSelected = connectorTableSelection.selectedTables;
    connectorTableSelection.selectedTables = currentSelected.includes(tableName)
      ? currentSelected.filter((t) => t !== tableName)
      : [...currentSelected, tableName];
    setConnectorTableSelection({ ...connectorTableSelection });
  };

  const handleSelectAllConnector = () => {
    if (
      connectorTableSelection.selectedTables.length ===
      connectorTableSelection.availableTables.length
    ) {
      connectorTableSelection.selectedTables = [];
    } else {
      connectorTableSelection.selectedTables = [
        ...connectorTableSelection.availableTables,
      ];
    }
    setConnectorTableSelection({ ...connectorTableSelection });
  };

  // Handle select/deselect all per file
  const handleSelectAll = (index: number) => {
    const newSelections = [...fileSelections];
    const fileSelection = newSelections[index];

    if (
      fileSelection.selectedTables.length ===
      fileSelection.availableTables.length
    ) {
      newSelections[index].selectedTables = [];
    } else {
      newSelections[index].selectedTables = [...fileSelection.availableTables];
    }

    setFileSelections(newSelections);
  };

  // Check if upload button should be disabled
  const isUploadDisabled = () => {
    // 1️⃣ Global: sedang upload
    if (uploading) return true;

    // 2️⃣ FILE SOURCE
    if (sourceType === "file") {
      // Harus ada minimal 1 file
      const hasFiles = fileSelections.some((fs) => fs.file !== null);
      if (!hasFiles) return true;

      // Structured ingestion → wajib pilih table jika mode select
      if (ingestionType === "structured") {
        const hasInvalidSelection = fileSelections.some((fs) => {
          if (!fs.file) return false; // skip slot kosong
          return fs.mode === "select" && fs.selectedTables.length === 0;
        });

        if (hasInvalidSelection) return true;
      }

      return false;
    }

    // 3️⃣ CONNECTOR SOURCE
    if (sourceType === "connector") {
      return (
        !connectorData.name.trim() ||
        !connectorData.host.trim() ||
        !connectorData.database.trim() ||
        !connectorData.username.trim() ||
        !connectorData.password.trim()
      );
    }

    // 4️⃣ OPENAPI SOURCE
    if (sourceType === "openapi") {
      return !OpenApiData.url.trim();
    }

    // 5️⃣ Fallback (aman)
    return true;
  };

  // Load ingestion history when component mounts
  useEffect(() => {
    if (chatbotId) {
      loadIngestionHistory();
    }
  }, [chatbotId]);

  const loadIngestionHistory = () => {
    const mockHistory: IngestionHistory[] = [];
    setIngestionHistory(mockHistory);
  };

  const handleConnectorChange = (field: keyof ConnectorData, value: any) => {
    setConnectorData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setUploadMessage("");
    setUploadError("");
  };

  const handleUpload = async () => {
    if (sourceType === "file") {
      const validFiles = fileSelections.filter((fs) => fs.file !== null);
      if (validFiles.length === 0) {
        setUploadError("Please select at least one file");
        return;
      }
    } else if (sourceType === "openapi") {
      if (!OpenApiData.url.trim()) {
        setUploadError("Please enter OpenAPI URL");
        return;
      }
    } else {
      // Validate connector fields
      if (!connectorData.name.trim()) {
        setUploadError("Please enter connection name");
        return;
      }
      if (!connectorData.host.trim()) {
        setUploadError("Please enter host");
        return;
      }
      if (!connectorData.database.trim()) {
        setUploadError("Please enter database name");
        return;
      }
      if (!connectorData.username.trim()) {
        setUploadError("Please enter username");
        return;
      }
      if (!connectorData.password.trim()) {
        setUploadError("Please enter password");
        return;
      }
    }

    if (!chatbotId) {
      setUploadError("Chatbot ID is required. Please save chatbot first.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      setUploadMessage("");
      setUploadProgress(0);

      let response;
      if (sourceType === "file") {
        const validFiles = fileSelections
          .filter((fs) => fs.file !== null)
          .map((fs) => fs.file!);

        const onUploadProgress = (progress: number) => {
          setUploadProgress(progress);
        };

        if (ingestionType === "structured") {
          response = await ingestStructuredFile(
            validFiles,
            chatbotId,
            fileSelections.reduce((acc, fs) => {
              if (fs.file) {
                acc[fs.file.name] = fs.mode === "all" ? [] : fs.selectedTables;
              }
              return acc;
            }, {} as SelectedTables),
            onUploadProgress
          );
          
        }else {
          response = await ingestUnstructuredFile(
            validFiles,
            chatbotId,
            onUploadProgress
          );
        }

        setUploadMessage(`Ingestion successful!`);

        // Add to history for each file
        validFiles.forEach((file) => {
          const newHistory: IngestionHistory = {
            id: Date.now().toString() + Math.random(),
            filename: file.name,
            type: ingestionType,
            source: "file",
            status: "success",
            created_at: new Date().toISOString(),
          };
          setIngestionHistory((prev) => [newHistory, ...prev]);
        });

        setUploadMessage(`${response}`);

        // Reset file selections
        setFileSelections([
          {
            file: null,
            mode: "all",
            availableTables: [],
            selectedTables: [],
          },
        ]);

        // Reset file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach((input) => {
          (input as HTMLInputElement).value = "";
        });
      } else if (sourceType === "openapi") {
        response = await ingestOpenApI(
          OpenApiData.url,
          chatbotId,
          OpenApiData.headers,
          (progress) => {
            setUploadProgress(progress);
          }
        );

        const newHistory: IngestionHistory = {
          id: Date.now().toString(),
          filename: OpenApiData.url,
          type: "structured",
          source: "openapi",
          status: "success",
          created_at: new Date().toISOString(),
        };
        setIngestionHistory((prev) => [newHistory, ...prev]);

        setUploadMessage(`OpenAPI ingestion successful! ${response}`);
      } else {
        console.log("selected tables:", connectorTableSelection.selectedTables);
        response = await ingestStructuredDb(
          connectorData,
          chatbotId,
          connectorTableSelection.selectedTables,
          (progress) => {
            setUploadProgress(progress);
          }
        );

        setUploadMessage(`Database connection configured successfully! ${response}`);

        const newHistory: IngestionHistory = {
          id: Date.now().toString(),
          filename: connectorData.name,
          type: "connector",
          source: connectorData.type,
          status: "success",
          created_at: new Date().toISOString(),
        };
        setIngestionHistory((prev) => [newHistory, ...prev]);

        setConnectorData({
          type: "postgresql",
          name: "",
          host: "",
          port: 5432,
          database: "",
          username: "",
          password: "",
        });
      }

      if (onIngestionComplete) {
        onIngestionComplete();
      }
    } catch (error: any) {
      setUploadError("Failed to process ingestion. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const fileFormats = {
    structured: "CSV, SQL, XLSX",
    unstructured: "DOCS, PDF, PNG",
  };

  return (
    <div className="border-t border-gray-200 pt-6 mt-6">
      <h3 className="text-lg font-semibold font-inter text-gray-900 mb-4">
        Data Ingestion
      </h3>

      {/* Ingestion History */}
      {ingestionHistory.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium font-inter text-gray-900">
              Ingestion History
            </label>
            <span className="text-xs font-inter px-3 py-1 bg-gray-200 text-gray-700 rounded-full">
              {ingestionHistory.length} ingestion
              {ingestionHistory.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {ingestionHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-sm font-medium font-inter text-gray-900 truncate">
                      {item.filename}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-inter ${
                        item.type === "structured"
                          ? "bg-blue-100 text-blue-700"
                          : item.type === "unstructured"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.type === "connector" ? item.source : item.type}
                    </span>
                    <span className="text-xs text-gray-500 font-inter">
                      {new Date(item.created_at).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-inter ${
                      item.status === "success"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.status === "success" ? "✓ Success" : "✗ Failed"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Ingestion Type Selection */}
        <div>
          <label className="block text-sm font-medium font-inter text-gray-900 mb-3">
            Ingestion Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="ingestion_type"
                value="structured"
                checked={ingestionType === "structured"}
                onChange={(e) => {
                  setIngestionType(
                    e.target.value as "structured" | "unstructured"
                  );
                  setUploadMessage("");
                  setUploadError("");
                }}
                className="w-4 h-4"
                disabled={uploading}
              />
              <span className="text-sm font-inter text-gray-700">
                Structured ({fileFormats.structured})
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="ingestion_type"
                value="unstructured"
                checked={ingestionType === "unstructured"}
                onChange={(e) => {
                  setIngestionType(
                    e.target.value as "structured" | "unstructured"
                  );
                  setUploadMessage("");
                  setUploadError("");
                }}
                className="w-4 h-4"
                disabled={uploading}
              />
              <span className="text-sm font-inter text-gray-700">
                Unstructured ({fileFormats.unstructured})
              </span>
            </label>
          </div>
        </div>

        {/* Source Type Selection - Only for Structured */}
        {ingestionType === "structured" && (
          <div>
            <label className="block text-sm font-medium font-inter text-gray-900 mb-3">
              Source Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="source_type"
                  value="file"
                  checked={sourceType === "file"}
                  onChange={(e) => {
                    setSourceType(e.target.value as "file" | "connector" | "openapi");
                    setUploadMessage("");
                    setUploadError("");
                  }}
                  className="w-4 h-4"
                  disabled={uploading}
                />
                <span className="text-sm font-inter text-gray-700">
                  File Upload
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="source_type"
                  value="connector"
                  checked={sourceType === "connector"}
                  onChange={(e) => {
                    setSourceType(e.target.value as "file" | "connector" | "openapi");
                    setUploadMessage("");
                    setUploadError("");
                  }}
                  className="w-4 h-4"
                  disabled={uploading}
                />
                <span className="text-sm font-inter text-gray-700">
                  Database Connector
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="source_type"
                  value="openapi"
                  checked={sourceType === "openapi"}
                  onChange={(e) => {
                    setSourceType(e.target.value as "file" | "connector" | "openapi");
                    setUploadMessage("");
                    setUploadError("");
                  }}
                  className="w-4 h-4"
                  disabled={uploading}
                />
                <span className="text-sm font-inter text-gray-700">
                  OpenAPI Endpoint
                </span>
              </label>
            </div>
          </div>
        )}

        {/* File Input Section */}
        {sourceType === "file" && (
          <div className="space-y-4">
            <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
              Upload Files
            </label>

            {fileSelections.map((fileSelection, index) => (
              <div
                key={index}
                className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                {/* File Input Row */}
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, index)}
                      disabled={uploading}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 cursor-pointer"
                      accept={
                        ingestionType === "structured"
                          ? ".csv,.xlsx,.xls,.sql"
                          : ".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      }
                    />
                    {fileSelection.file && (
                      <p className="text-xs text-gray-600 mt-1 font-inter">
                        Selected: {fileSelection.file.name}
                      </p>
                    )}
                  </div>

                  {fileSelections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFileField(index)}
                      disabled={uploading}
                      className="mt-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      title="Remove file"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Table Selection untuk file ini - hanya untuk structured & jika file ada */}
                {fileSelection.file && ingestionType === "structured" && (
                  <div className="space-y-3 ml-2 pl-4 border-l-2 border-blue-200">
                    {/* Radio Button Mode Selection */}
                    <div>
                      <label className="block text-xs font-medium font-inter text-gray-700 mb-2">
                        Table Selection for {fileSelection.file.name}:
                      </label>
                      <div className="flex gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`mode_${index}`}
                            value="all"
                            checked={fileSelection.mode === "all"}
                            onChange={() => handleModeChange(index, "all")}
                            className="w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                            disabled={uploading}
                          />
                          <span className="text-xs font-inter text-gray-700">
                            All Tables
                          </span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`mode_${index}`}
                            value="select"
                            checked={fileSelection.mode === "select"}
                            onChange={() => handleModeChange(index, "select")}
                            className="w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                            disabled={uploading}
                          />
                          <span className="text-xs font-inter text-gray-700">
                            Select Specific Tables
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Retrieve Tables Button - hanya muncul jika mode select */}
                    {fileSelection.mode === "select" && (
                      <button
                        type="button"
                        onClick={() => retrieveTablesForFile(index)}
                        disabled={uploading || !fileSelection.file}
                        className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-inter rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading ? "Retrieving..." : "Retrieve Tables"}
                      </button>
                    )}

                    {/* Table List - hanya muncul jika mode select dan ada tables */}
                    {fileSelection.mode === "select" &&
                      fileSelection.availableTables.length > 0 && (
                        <div className="border border-gray-200 rounded-lg p-3 bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-medium font-inter text-gray-900">
                              Available Tables:
                            </label>
                            <button
                              type="button"
                              onClick={() => handleSelectAll(index)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-inter disabled:opacity-50"
                              disabled={uploading}
                            >
                              {fileSelection.selectedTables.length ===
                              fileSelection.availableTables.length
                                ? "Deselect All"
                                : "Select All"}
                            </button>
                          </div>

                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {fileSelection.availableTables.map(
                              (table, tableIndex) => (
                                <label
                                  key={tableIndex}
                                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                                >
                                  <input
                                    type="checkbox"
                                    checked={fileSelection.selectedTables.includes(
                                      table
                                    )}
                                    onChange={() =>
                                      handleTableToggle(index, table)
                                    }
                                    className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    disabled={uploading}
                                  />
                                  <span className="text-xs font-inter text-gray-700">
                                    {table}
                                  </span>
                                </label>
                              )
                            )}
                          </div>

                          {fileSelection.selectedTables.length > 0 && (
                            <p className="text-xs text-gray-500 mt-2 font-inter">
                              {fileSelection.selectedTables.length} of{" "}
                              {fileSelection.availableTables.length} table(s)
                              selected
                            </p>
                          )}

                          {fileSelection.selectedTables.length === 0 && (
                            <p className="text-xs text-amber-600 mt-2 font-inter">
                              ⚠️ Please select at least one table
                            </p>
                          )}
                        </div>
                      )}

                    {/* Info ketika mode select tapi belum retrieve */}
                    {fileSelection.mode === "select" &&
                      fileSelection.availableTables.length === 0 && (
                        <div className="border border-blue-200 rounded-lg p-2 bg-blue-50">
                          <p className="text-xs text-blue-700 font-inter">
                            ℹ️ "Click "Retrieve Tables" to see available tables
                          </p>
                        </div>
                      )}
                  </div>
                )}
              </div>
            ))}

            {/* Add Another File Button */}
            <button
              type="button"
              onClick={addFileField}
              disabled={uploading}
              className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 font-inter text-gray-600 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Another File
            </button>

            <p className="text-xs text-gray-500 font-inter">
              Supported formats: {fileFormats[ingestionType]}
            </p>
          </div>
        )}
        {/* Database Connector Section */}
        {sourceType === "connector" && ingestionType === "structured" && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {/* Connection Name */}
            <div>
              <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
                Connection Name *
              </label>
              <input
                type="text"
                value={connectorData.name}
                onChange={(e) => handleConnectorChange("name", e.target.value)}
                placeholder="e.g., Production Database"
                disabled={uploading}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
              />
            </div>

            {/* Database Type */}
            <div>
              <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
                Database Type *
              </label>
              <select
                value={connectorData.type}
                onChange={(e) => handleConnectorChange("type", e.target.value)}
                disabled={uploading}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
              >
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="mssql">SQL Server</option>
                <option value="oracle">Oracle</option>
                <option value="mongodb">MongoDB</option>
                <option value="sqlite">SQLite</option>
              </select>
            </div>

            {/* Host */}
            <div>
              <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
                Host *
              </label>
              <input
                type="text"
                value={connectorData.host}
                onChange={(e) => handleConnectorChange("host", e.target.value)}
                placeholder="e.g., localhost or 192.168.1.1"
                disabled={uploading}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
              />
            </div>

            {/* Port */}
            <div>
              <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
                Port *
              </label>
              <input
                type="number"
                value={connectorData.port}
                onChange={(e) =>
                  handleConnectorChange(
                    "port",
                    parseInt(e.target.value) || e.target.value
                  )
                }
                placeholder="e.g., 5432"
                disabled={uploading}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
              />
            </div>

            {/* Database Name */}
            <div>
              <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
                Database Name *
              </label>
              <input
                type="text"
                value={connectorData.database}
                onChange={(e) =>
                  handleConnectorChange("database", e.target.value)
                }
                placeholder="e.g., myapp_db"
                disabled={uploading}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
                Username *
              </label>
              <input
                type="text"
                value={connectorData.username}
                onChange={(e) =>
                  handleConnectorChange("username", e.target.value)
                }
                placeholder="e.g., admin"
                disabled={uploading}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={connectorData.password}
                onChange={(e) =>
                  handleConnectorChange("password", e.target.value)
                }
                placeholder="Enter database password"
                disabled={uploading}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
              />
            </div>

            <p className="text-xs text-gray-500 font-inter">
              * Required fields
            </p>

            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`mode_type`}
                  value="all"
                  checked={connectorTableSelection.mode === "all"}
                  onChange={() => handleConnectorModeChange("all")}
                  className="w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                  disabled={uploading}
                />
                <span className="text-xs font-inter text-gray-700">
                  All Tables
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`mode_type`}
                  value="select"
                  checked={connectorTableSelection.mode === "select"}
                  onChange={() => handleConnectorModeChange("select")}
                  className="w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                  disabled={uploading}
                />
                <span className="text-xs font-inter text-gray-700">
                  Select Specific Tables
                </span>
              </label>
            </div>

            {/* Retrieve Tables Button - hanya muncul jika mode select */}
            {connectorTableSelection.mode === "select" && (
              <button
                type="button"
                onClick={() => retrieveTablesForConnector()}
                disabled={uploading || !connectorData}
                className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-inter rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Retrieving..." : "Retrieve Tables"}
              </button>
            )}

            {/* Table List - hanya muncul jika mode select dan ada tables */}
            {connectorTableSelection.mode === "select" &&
              connectorTableSelection.availableTables.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium font-inter text-gray-900">
                      Available Tables:
                    </label>
                    <button
                      type="button"
                      onClick={() => handleSelectAllConnector()}
                      className="text-xs text-blue-600 hover:text-blue-700 font-inter disabled:opacity-50"
                      disabled={uploading}
                    >
                      {connectorTableSelection.selectedTables.length ===
                      connectorTableSelection.availableTables.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>

                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {connectorTableSelection.availableTables.map(
                      (table, tableIndex) => (
                        <label
                          key={tableIndex}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={connectorTableSelection.selectedTables.includes(
                              table
                            )}
                            onChange={() => handleConnectorTableToggle(table)}
                            className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            disabled={uploading}
                          />
                          <span className="text-xs font-inter text-gray-700">
                            {table}
                          </span>
                        </label>
                      )
                    )}
                  </div>

                  {connectorTableSelection.selectedTables.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2 font-inter">
                      {connectorTableSelection.selectedTables.length} of{" "}
                      {connectorTableSelection.availableTables.length} table(s)
                      selected
                    </p>
                  )}

                  {connectorTableSelection.selectedTables.length === 0 && (
                    <p className="text-xs text-amber-600 mt-2 font-inter">
                      ⚠️ Please select at least one table
                    </p>
                  )}
                </div>
              )}

            {/* Info ketika mode select tapi belum retrieve */}
            {connectorTableSelection.mode === "select" &&
              connectorTableSelection.availableTables.length === 0 && (
                <div className="border border-blue-200 rounded-lg p-2 bg-blue-50">
                  <p className="text-xs text-blue-700 font-inter">
                    ℹ️ "Click "Retrieve Tables" to see available tables
                  </p>
                </div>
              )}
          </div>
        )}

        {sourceType === "openapi" && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {/* OpenAPI URL */}
            <div>
              <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
                OpenAPI URL *
              </label>
              <input
                type="text"
                value={OpenApiData.url}
                onChange={(e) =>
                  setOpenApiData({ ...OpenApiData, url: e.target.value })
                }
                placeholder="e.g., https://api.example.com/openapi.json"
                disabled={uploading}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
              />
            </div>
            {/* Headers Input */}
            <div>
              <label className="block text-sm font-medium font-inter text-gray-900 mb-2"> 
                Headers (optional)
              </label>
              <textarea
                value={openApiHeadersText}
                onChange={(e) => {
                  const value = e.target.value;

                  // ✅ selalu update textarea
                  setOpenApiHeadersText(value);

                  // ✅ update object hanya kalau JSON valid
                  try {
                    const parsed = JSON.parse(value);
                    setOpenApiData({
                      ...OpenApiData,
                      headers: parsed,
                    });
                  } catch {
                    // biarkan user lanjut mengetik
                  }
                }}
                placeholder='e.g., { "Authorization": "Bearer your_token" }'
                disabled={uploading}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 h-24 resize-none"
              />
            </div>
            <p className="text-xs text-gray-500 font-inter">
              * Required fields
            </p>
          </div>
        )}

                {/* Progress Bar */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-inter text-gray-600">
              <span>
                {uploadProgress < 50
                  ? "Uploading file..."
                  : uploadProgress < 100
                  ? "Processing and embedding data..."
                  : "Finalizing..."}
              </span>
              <span className="font-semibold">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 font-inter italic">
              {uploadProgress < 50
                ? "Mengirim file ke server..."
                : "Backend sedang memproses: chunking, embedding, dan menyimpan ke vector database..."}
            </p>
          </div>
        )}
        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={
            isUploadDisabled()
          }
          className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-inter font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Processing..." : "Upload Data"}
        </button>

        {/* Messages */}
        {uploadMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-inter text-green-700 whitespace-pre-line">
              {uploadMessage}
            </p>
          </div>
        )}

        {uploadError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-inter text-red-600">{uploadError}</p>
          </div>
        )}
      </div>
    </div>
  );
}
