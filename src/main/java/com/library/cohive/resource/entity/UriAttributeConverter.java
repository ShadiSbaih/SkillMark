package com.library.cohive.resource.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.net.URI;

/**
 * Persists {@link URI} values as strings while keeping the entity model strongly typed.
 */
@Converter
public class UriAttributeConverter implements AttributeConverter<URI, String> {

    @Override
    public String convertToDatabaseColumn(URI attribute) {
        return attribute == null ? null : attribute.toString();
    }

    @Override
    public URI convertToEntityAttribute(String dbData) {
        return dbData == null ? null : URI.create(dbData);
    }
}
