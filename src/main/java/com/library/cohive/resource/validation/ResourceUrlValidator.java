package com.library.cohive.resource.validation;

import com.library.cohive.resource.entity.ResourceType;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.BeanWrapperImpl;

import java.net.URI;

/**
 * Shared validator for DTOs and entities that hold a {@link ResourceType} and URL pair.
 */
public class ResourceUrlValidator implements ConstraintValidator<ValidResourceUrl, Object> {

    private String typeField;
    private String urlField;

    @Override
    public void initialize(ValidResourceUrl constraintAnnotation) {
        this.typeField = constraintAnnotation.typeField();
        this.urlField = constraintAnnotation.urlField();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        BeanWrapperImpl bean = new BeanWrapperImpl(value);
        Object rawType = bean.getPropertyValue(typeField);
        Object rawUrl = bean.getPropertyValue(urlField);

        if (!(rawType instanceof ResourceType type) || rawUrl == null) {
            return true;
        }

        URI uri;
        try {
            uri = rawUrl instanceof URI resourceUri ? resourceUri : URI.create(rawUrl.toString().trim());
        } catch (IllegalArgumentException ex) {
            buildViolation(context, "URL must be a valid absolute URI");
            return false;
        }

        if (!type.supports(uri)) {
            buildViolation(context, type.getValidationRule());
            return false;
        }

        return true;
    }

    private void buildViolation(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message)
                .addPropertyNode(urlField)
                .addConstraintViolation();
    }
}
