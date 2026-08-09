package com.estatehub.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler returning RFC 7807 problem+json responses,
 * per SRS Appendix D.2.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PropertyAlreadyBookedException.class)
    public ProblemDetail handlePropertyAlreadyBooked(PropertyAlreadyBookedException ex) {
        return build(HttpStatus.CONFLICT, "Property Already Booked", ex.getMessage());
    }

    @ExceptionHandler(ReraRequiredException.class)
    public ProblemDetail handleReraRequired(ReraRequiredException ex) {
        return build(HttpStatus.BAD_REQUEST, "RERA Number Required", ex.getMessage());
    }

    @ExceptionHandler(AgentKycIncompleteException.class)
    public ProblemDetail handleAgentKycIncomplete(AgentKycIncompleteException ex) {
        return build(HttpStatus.FORBIDDEN, "Agent KYC Incomplete", ex.getMessage());
    }

    @ExceptionHandler(InsufficientPhotosException.class)
    public ProblemDetail handleInsufficientPhotos(InsufficientPhotosException ex) {
        return build(HttpStatus.BAD_REQUEST, "Insufficient Photos", ex.getMessage());
    }

    @ExceptionHandler(AgreementAlreadyExecutedException.class)
    public ProblemDetail handleAgreementAlreadyExecuted(AgreementAlreadyExecutedException ex) {
        return build(HttpStatus.CONFLICT, "Agreement Already Executed", ex.getMessage());
    }

    @ExceptionHandler(TenancyOverlapException.class)
    public ProblemDetail handleTenancyOverlap(TenancyOverlapException ex) {
        return build(HttpStatus.CONFLICT, "Tenancy Overlap", ex.getMessage());
    }

    @ExceptionHandler(DocumentAccessDeniedException.class)
    public ProblemDetail handleDocumentAccessDenied(DocumentAccessDeniedException ex) {
        return build(HttpStatus.FORBIDDEN, "Document Access Denied", ex.getMessage());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleResourceNotFound(ResourceNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, "Resource Not Found", ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail handleAccessDenied(AccessDeniedException ex) {
        return build(HttpStatus.FORBIDDEN, "Access Denied", "You do not have permission to perform this action.");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleIllegalArgument(IllegalArgumentException ex) {
        return build(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ProblemDetail handleBadCredentials(BadCredentialsException ex) {
        return build(HttpStatus.UNAUTHORIZED, "Invalid Credentials", "Mobile number or password is incorrect.");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe ->
                fieldErrors.put(fe.getField(), fe.getDefaultMessage()));
        ProblemDetail pd = build(HttpStatus.BAD_REQUEST, "Validation Failed", "One or more fields are invalid.");
        pd.setProperty("errors", fieldErrors);
        return pd;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneric(Exception ex) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", "An unexpected error occurred.");
    }

    private ProblemDetail build(HttpStatus status, String title, String detail) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(status, detail);
        pd.setTitle(title);
        pd.setProperty("timestamp", Instant.now());
        return pd;
    }
}
