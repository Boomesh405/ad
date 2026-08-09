package com.estatehub.exception;

public class TenancyOverlapException extends RuntimeException {
    public TenancyOverlapException(String message) { super(message); }
}
