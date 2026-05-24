package com.library.Skillmark.media.service;

import org.springframework.stereotype.Service;

@Service
public class CloudinaryMediaService {
    public String provider() {
        return "CLOUDINARY";
    }
}
