package com.library.Skillmark.storage.service;

public interface StorageService {
    String provider();

    /**
     * Uploads bytes directly to storage and returns the public URL.
     */
    String uploadBytes(String objectKey, byte[] data, String contentType);
}
