package com.library.Skillmark.storage.service;

import com.library.Skillmark.common.exception.BusinessRuleException;
import com.library.Skillmark.storage.dto.R2UploadUrlResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;

@Service
public class R2StorageService implements StorageService {
    private final String accountId;
    private final String accessKeyId;
    private final String secretAccessKey;
    private final String bucketName;
    private final String publicBaseUrl;

    public R2StorageService(@Value("${r2.account-id:}") String accountId,
                            @Value("${r2.access-key-id:}") String accessKeyId,
                            @Value("${r2.secret-access-key:}") String secretAccessKey,
                            @Value("${r2.bucket-name:}") String bucketName,
                            @Value("${r2.public-base-url:}") String publicBaseUrl) {
        this.accountId = accountId;
        this.accessKeyId = accessKeyId;
        this.secretAccessKey = secretAccessKey;
        this.bucketName = bucketName;
        this.publicBaseUrl = publicBaseUrl;
    }

    @Override
    public String provider() {
        return "R2";
    }

    public R2UploadUrlResponse createUploadUrl(String objectKey, String contentType) {
        ensureConfigured();
        Instant expiresAt = Instant.now().plus(Duration.ofMinutes(15));
        try (S3Presigner presigner = S3Presigner.builder()
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKeyId, secretAccessKey)))
                .region(Region.of("auto"))
                .endpointOverride(URI.create("https://" + accountId + ".r2.cloudflarestorage.com"))
                .build()) {
            PutObjectRequest.Builder putObject = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey);
            if (StringUtils.hasText(contentType)) {
                putObject.contentType(contentType);
            }
            var presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(15))
                    .putObjectRequest(putObject.build())
                    .build();
            String publicUrl = StringUtils.hasText(publicBaseUrl)
                    ? publicBaseUrl.replaceAll("/+$", "") + "/" + objectKey
                    : null;
            return new R2UploadUrlResponse(presigner.presignPutObject(presignRequest).url().toString(),
                    objectKey, publicUrl, expiresAt);
        }
    }

    private void ensureConfigured() {
        if (!StringUtils.hasText(accountId) || !StringUtils.hasText(accessKeyId)
                || !StringUtils.hasText(secretAccessKey) || !StringUtils.hasText(bucketName)) {
            throw new BusinessRuleException("Cloudflare R2 is not configured");
        }
    }
}
