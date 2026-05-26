package com.library.Skillmark.security.clerk;

import com.library.Skillmark.common.response.ApiResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ClerkWebhookController {
    private final ClerkWebhookService clerkWebhookService;

    public ClerkWebhookController(ClerkWebhookService clerkWebhookService) {
        this.clerkWebhookService = clerkWebhookService;
    }

    @PostMapping("/api/v1/webhooks/clerk")
    ApiResponse<Void> handle(@RequestBody String payload,
                             @RequestHeader(value = "svix-id", required = false) String svixId,
                             @RequestHeader(value = "svix-timestamp", required = false) String svixTimestamp,
                             @RequestHeader(value = "svix-signature", required = false) String svixSignature) {
        clerkWebhookService.handle(payload, svixId, svixTimestamp, svixSignature);
        return ApiResponse.success("Clerk webhook processed successfully", null);
    }
}
