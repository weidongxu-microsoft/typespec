// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

package com.microsoft.typespec.http.client.generator.core.extension.model.codemodel;

import java.util.Objects;

/**
 * Represents a constant value.
 */
public class ConstantValue {
    private Languages language;
    private Object value;
    private DictionaryAny extensions;

    /**
     * Creates a new instance of the ConstantValue class.
     */
    public ConstantValue() {
    }

    /**
     * Gets the language of the value. (Required)
     *
     * @return The language of the value.
     */
    public Languages getLanguage() {
        return language;
    }

    /**
     * Sets the language of the value. (Required)
     *
     * @param language The language of the value.
     */
    public void setLanguage(Languages language) {
        this.language = language;
    }

    /**
     * Gets the actual constant value to use. (Required)
     *
     * @return The actual constant value to use.
     */
    public Object getValue() {
        return value;
    }

    /**
     * Sets the actual constant value to use. (Required)
     *
     * @param value The actual constant value to use.
     */
    public void setValue(Object value) {
        this.value = value;
    }

    /**
     * Gets the custom extensible metadata for individual language generators.
     *
     * @return The custom extensible metadata for individual language generators.
     */
    public DictionaryAny getExtensions() {
        return extensions;
    }

    /**
     * Sets the custom extensible metadata for individual language generators.
     *
     * @param extensions The custom extensible metadata for individual language generators.
     */
    public void setExtensions(DictionaryAny extensions) {
        this.extensions = extensions;
    }

    @Override
    public String toString() {
        return ConstantValue.class.getName() + "@" + Integer.toHexString(System.identityHashCode(this)) + "[language="
            + language + ", value=" + value + ", extensions=" + extensions + "]";
    }

    @Override
    public int hashCode() {
        return Objects.hash(language, extensions, value);
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }

        if (!(other instanceof ConstantValue)) {
            return false;
        }

        ConstantValue rhs = ((ConstantValue) other);
        return Objects.equals(language, rhs.language)
            && Objects.equals(extensions, rhs.extensions)
            && Objects.equals(value, rhs.value);
    }
}
