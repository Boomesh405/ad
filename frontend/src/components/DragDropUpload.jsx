import { useState, useRef } from "react";
import { api } from "../api.js";

const DOC_TYPES = [
  { value: "TITLE_DEED", label: "📜 Title Deed" },
  { value: "TAX_RECEIPT", label: "🧾 Tax Receipt" },
  { value: "ENCUMBRANCE_CERT", label: "📋 Encumbrance Certificate" },
  { value: "FLOOR_PLAN", label: "📐 Floor Plan" },
  { value: "APPROVAL_PLAN", label: "✅ Approval Plan" },
  { value: "OTHER", label: "📄 Other" },
];

export default function DragDropUpload({ propertyId, onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState([]);
  const [error, setError] = useState("");
  const [docType, setDocType] = useState("TITLE_DEED");
  const fileInputRef = useRef(null);

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }

  async function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  }

  function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    uploadFiles(files);
    e.target.value = "";
  }

  async function uploadFiles(files) {
    if (!files.length) return;
    setUploading(true);
    setError("");

    const results = [];
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        // Step 1: Upload the file
        const uploadResult = await api("/uploads", {
          method: "POST",
          body: formData,
          isFormData: true,
        });

        // Step 2: Link it to the property
        await api(`/properties/${propertyId}/documents`, {
          method: "POST",
          body: {
            docType: docType,
            docName: file.name,
            fileUrl: uploadResult.fileUrl,
            fileSizeBytes: file.size,
          },
        });

        results.push({
          name: file.name,
          size: file.size,
          url: uploadResult.fileUrl,
          type: docType,
        });
      } catch (err) {
        setError(`Failed to upload ${file.name}: ${err.message}`);
      }
    }

    setUploaded((prev) => [...prev, ...results]);
    setUploading(false);
    if (results.length > 0 && onUploaded) {
      onUploaded(results);
    }
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  return (
    <div className="drag-drop-upload">
      {/* Doc type selector */}
      <div className="upload-type-row">
        <label>
          Document type
          <select value={docType} onChange={(e) => setDocType(e.target.value)}>
            {DOC_TYPES.map((dt) => (
              <option key={dt.value} value={dt.value}>{dt.label}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Drop zone */}
      <div
        className={`drop-zone ${dragging ? "dragging" : ""} ${uploading ? "uploading" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        {uploading ? (
          <div className="drop-zone-content">
            <div className="upload-spinner" />
            <p>Uploading…</p>
          </div>
        ) : (
          <div className="drop-zone-content">
            <div className="drop-icon">📁</div>
            <p className="drop-title">Drag & drop files here</p>
            <p className="drop-subtitle">or click to browse</p>
            <p className="drop-formats">PDF, JPEG, PNG, WebP, DOC, DOCX — max 10 MB</p>
          </div>
        )}
      </div>

      {error && <div className="alert error">{error}</div>}

      {/* Uploaded files list */}
      {uploaded.length > 0 && (
        <div className="uploaded-files">
          <h4>Uploaded ({uploaded.length})</h4>
          {uploaded.map((f, i) => (
            <div key={i} className="uploaded-item">
              <span className="uploaded-icon">
                {f.name.endsWith(".pdf") ? "📄" : "🖼️"}
              </span>
              <div className="uploaded-info">
                <span className="uploaded-name">{f.name}</span>
                <span className="uploaded-meta">
                  {formatSize(f.size)} · {DOC_TYPES.find(d => d.value === f.type)?.label || f.type}
                </span>
              </div>
              <a href={f.url} target="_blank" rel="noopener noreferrer" className="uploaded-link">
                View ↗
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
