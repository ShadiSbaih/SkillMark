package com.library.cohive.resource.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Validates that a resource URL is syntactically correct and compatible with the selected type.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ResourceUrlValidator.class)
public @interface ValidResourceUrl {

    String message() default "Resource URL is invalid for the selected type";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    String typeField() default "type";

    String urlField() default "url";
}
