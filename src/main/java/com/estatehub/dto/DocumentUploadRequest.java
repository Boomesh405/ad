package com.estatehub.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DocumentUploadRequest {
    @NotBlank(message = "Document type is required")
    private String docType;  // TITLE_DEED, TAX_RECEIPT, ENCUMBRANCE_CERT, FLOOR_PLAN, APPROVAL_PLAN, OTHER

    @NotBlank(message = "Document name is required")
    private String docName;

    @NotBlank(message = "File URL is required")
    private String fileUrl;  // In production this would be an S3 presigned URL or upload path

    private Long fileSizeBytes;
}
