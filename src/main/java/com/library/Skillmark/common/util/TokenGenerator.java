package com.library.Skillmark.common.util;

import java.security.SecureRandom;
import java.util.Base64;

public final class TokenGenerator {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final char[] UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();

    private TokenGenerator() {
    }

    public static String randomToken() {
        byte[] bytes = new byte[48];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public static String randomUppercase(int length) {
        StringBuilder value = new StringBuilder(length);
        for (int index = 0; index < length; index++) {
            value.append(UPPERCASE[RANDOM.nextInt(UPPERCASE.length)]);
        }
        return value.toString();
    }
}
