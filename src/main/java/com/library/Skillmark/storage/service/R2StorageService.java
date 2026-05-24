package com.library.Skillmark.storage.service;

import org.springframework.stereotype.Service;

@Service
public class R2StorageService implements StorageService {
    @Override
    public String provider() {
        return "R2";
    }
}
