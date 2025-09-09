import { createSdkContext } from "@azure-tools/typespec-client-generator-core";
import { EmitContext, NoTarget, Program, resolvePath } from "@typespec/compiler";
import { promises } from "fs";
import { OpenAI } from "openai";
import { stringify } from "yaml";
import { EmitterOptionsDev } from "./code-model-builder.js";
import { LibName, reportDiagnostic } from "./lib.js";
import { EmitterOptions, LIB_NAME } from "./options.js";
import { trace } from "./utils.js";
import { validateDependencies } from "./validate.js";

export async function $onEmit(context: EmitContext<EmitterOptions>) {
  const program = context.program;
  if (!program.compilerOptions.noEmit) {
    await validateDependencies(program, true);
  }

  if (!program.hasError()) {
    const options = context.options as EmitterOptionsDev;
    if (!options["flavor"]) {
      if (LibName === "@azure-tools/typespec-java") {
        options["flavor"] = "azure";
      }
    }

    await promises.mkdir(context.emitterOutputDir, { recursive: true }).catch((err) => {
      if (err.code !== "EISDIR" && err.code !== "EEXIST") {
        reportDiagnostic(program, {
          code: "unknown-error",
          format: {
            errorMessage: `Failed to create output directory: ${context.emitterOutputDir}.`,
          },
          target: NoTarget,
        });
        return;
      }
    });

    const client = new OpenAI({
      baseURL: process.env["AZURE_API_BASE"] + "/openai/v1/",
      apiKey: process.env["AZURE_API_KEY"],
    });

    const sdkContext = await createSdkContext(context, LIB_NAME, {
      versioning: { previewStringRegex: /$/ },
    });

    sdkContext.sdkPackage.models.forEach(async (model) => {
      const filename = resolvePath(context.emitterOutputDir, model.name + ".yaml");

      const yaml = stringify(
        model,
        (k, v) => {
          if (typeof k === "string" && k.startsWith("__")) {
            return undefined; // skip keys starting with "__" from the output
          }
          return v;
        },
        { lineWidth: 0 },
      );

      await program.host.writeFile(filename, yaml);

      const response = await client.responses.create({
        model: "gpt-5-mini",
        instructions:
          "You are an expert Java developer. Generate a Java class based on the provided YAML model. Ensure the class includes appropriate data types, constructors, getters, setters, and annotations for JSON serialization. Follow Java best practices and conventions.",
        input: yaml,
        reasoning: { effort: "low" },
      });

      const javaFilename = resolvePath(
        context.emitterOutputDir,
        "src/main/java/",
        model.name + ".java",
      );
      const text = response.output.find((o) => o.type === "message")?.content[0];
      if (text?.type === "output_text") {
        await program.host.writeFile(javaFilename, text.text);
      }
    });
  }
}

function reportJarOutput(program: Program, jarOutput: string) {
  const lines = jarOutput.split("\n");
  const logs: Array<string> = [];

  // parse stdout to array of logs
  let currentLog = undefined;
  for (const line of lines) {
    if (
      line.startsWith("TRACE ") ||
      line.startsWith("DEBUG ") ||
      line.startsWith("INFO ") ||
      line.startsWith("WARN ") ||
      line.startsWith("ERROR ")
    ) {
      if (currentLog) {
        logs.push(currentLog);
      }
      currentLog = line;
    } else if (currentLog) {
      currentLog = currentLog + "\n" + line;
    }
  }
  if (currentLog) {
    logs.push(currentLog);
  }

  // trace or report the logs, according to log level
  for (const log of logs) {
    if (log.startsWith("ERROR ")) {
      reportDiagnostic(program, {
        code: "generator-error",
        format: {
          errorMessage: log.substring(6),
        },
        target: NoTarget,
      });
    } else if (log.startsWith("WARN ")) {
      reportDiagnostic(program, {
        code: "generator-warning",
        format: {
          warningMessage: log.substring(5),
        },
        target: NoTarget,
      });
    } else {
      const index = log.indexOf(" ");
      trace(program, log.substring(index + 1));
    }
  }
}

const EXAMPLE_YAML = `kind: model
decorators: []
name: Builtin
isGeneratedName: false
namespace: TspTest.Builtin
properties:
  - apiVersions: []
    type:
      kind: boolean
      decorators: []
      name: boolean
      doc: Boolean with \`true\` and \`false\` values.
      crossLanguageDefinitionId: TypeSpec.boolean
    name: boolean
    isGeneratedName: false
    optional: false
    isApiVersionParam: false
    onClient: false
    crossLanguageDefinitionId: TspTest.Builtin.Builtin.boolean
    decorators: []
    visibility:
      - 1
      - 2
      - 4
      - 8
      - 16
    access: public
    kind: property
    discriminator: false
    serializedName: boolean
    isMultipartFileInput: false
    flatten: false
    serializationOptions: {}
  - apiVersions: []
    type:
      kind: string
      decorators: []
      name: string
      doc: A sequence of textual characters.
      crossLanguageDefinitionId: TypeSpec.string
    name: string
    isGeneratedName: false
    optional: false
    isApiVersionParam: false
    onClient: false
    crossLanguageDefinitionId: TspTest.Builtin.Builtin.string
    decorators: []
    visibility:
      - 1
      - 2
      - 4
      - 8
      - 16
    access: public
    kind: property
    discriminator: false
    serializedName: string
    isMultipartFileInput: false
    flatten: false
    serializationOptions: {}
  - apiVersions: []
    type:
      kind: bytes
      decorators: []
      name: bytes
      doc: Represent a byte array
      crossLanguageDefinitionId: TypeSpec.bytes
      encode: base64
    name: bytes
    isGeneratedName: false
    optional: false
    isApiVersionParam: false
    onClient: false
    crossLanguageDefinitionId: TspTest.Builtin.Builtin.bytes
    decorators: []
    visibility:
      - 1
      - 2
      - 4
      - 8
      - 16
    access: public
    kind: property
    discriminator: false
    serializedName: bytes
    isMultipartFileInput: false
    flatten: false
    serializationOptions: {}
  - apiVersions: []
    type:
      kind: int32
      decorators: []
      name: int32
      doc: A 32-bit integer. (\`-2,147,483,648\` to \`2,147,483,647\`)
      crossLanguageDefinitionId: TypeSpec.int32
    name: int
    isGeneratedName: false
    optional: false
    isApiVersionParam: false
    onClient: false
    crossLanguageDefinitionId: TspTest.Builtin.Builtin.int
    decorators: []
    visibility:
      - 1
      - 2
      - 4
      - 8
      - 16
    access: public
    kind: property
    discriminator: false
    serializedName: int
    isMultipartFileInput: false
    flatten: false
    serializationOptions: {}
  - apiVersions: []
    type:
      kind: safeint
      decorators: []
      name: safeint
      doc: An integer that can be serialized to JSON (\`−9007199254740991 (−(2^53 − 1))\` to \`9007199254740991 (2^53 − 1)\` )
      crossLanguageDefinitionId: TypeSpec.safeint
    name: safeint
    isGeneratedName: false
    optional: false
    isApiVersionParam: false
    onClient: false
    crossLanguageDefinitionId: TspTest.Builtin.Builtin.safeint
    decorators: []
    visibility:
      - 1
      - 2
      - 4
      - 8
      - 16
    access: public
    kind: property
    discriminator: false
    serializedName: safeint
    isMultipartFileInput: false
    flatten: false
    serializationOptions: {}
  - apiVersions: []
    type:
      kind: decimal
      decorators: []
      name: decimal
      doc: |-
        A decimal number with any length and precision. This represent any \`decimal\` value possible.
        It is commonly represented as \`BigDecimal\` in some languages.
      crossLanguageDefinitionId: TypeSpec.decimal
    name: decimal
    isGeneratedName: false
    optional: false
    isApiVersionParam: false
    onClient: false
    crossLanguageDefinitionId: TspTest.Builtin.Builtin.decimal
    decorators: []
    visibility:
      - 1
      - 2
      - 4
      - 8
      - 16
    access: public
    kind: property
    discriminator: false
    serializedName: decimal
    isMultipartFileInput: false
    flatten: false
    serializationOptions: {}
  - apiVersions: []
    type:
      kind: int64
      decorators: []
      name: int64
      doc: A 64-bit integer. (\`-9,223,372,036,854,775,808\` to \`9,223,372,036,854,775,807\`)
      crossLanguageDefinitionId: TypeSpec.int64
    name: long
    isGeneratedName: false
    optional: false
    isApiVersionParam: false
    onClient: false
    crossLanguageDefinitionId: TspTest.Builtin.Builtin.long
    decorators: []
    visibility:
      - 1
      - 2
      - 4
      - 8
      - 16
    access: public
    kind: property
    discriminator: false
    serializedName: long
    isMultipartFileInput: false
    flatten: false
    serializationOptions: {}
  - apiVersions: []
    type:
      kind: float32
      decorators: []
      name: float32
      doc: A 32 bit floating point number. (\`±1.5 x 10^−45\` to \`±3.4 x 10^38\`)
      crossLanguageDefinitionId: TypeSpec.float32
    name: float
    isGeneratedName: false
    optional: false
    isApiVersionParam: false
    onClient: false
    crossLanguageDefinitionId: TspTest.Builtin.Builtin.float
    decorators: []
    visibility:
      - 1
      - 2
      - 4
      - 8
      - 16
    access: public
    kind: property
    discriminator: false
    serializedName: float
    isMultipartFileInput: false
    flatten: false
    serializationOptions: {}
  - apiVersions: []
    type:
      kind: float64
      decorators: []
      name: float64
      doc: A 64 bit floating point number. (\`±5.0 × 10^−324\` to \`±1.7 × 10^308\`)
      crossLanguageDefinitionId: TypeSpec.float64
    name: double
    isGeneratedName: false
    optional: true
    isApiVersionParam: false
    onClient: false
    crossLanguageDefinitionId: TspTest.Builtin.Builtin.double
    decorators: []
    visibility:
      - 1
      - 2
      - 4
      - 8
      - 16
    access: public
    kind: property
    discriminator: false
    serializedName: double
    isMultipartFileInput: false
    flatten: false
    serializationOptions: {}
  - apiVersions: []
    type:
      kind: duration
      decorators: []
      name: duration
      encode: ISO8601
      wireType:
        kind: string
        decorators: []
        name: string
        doc: A sequence of textual characters.
        crossLanguageDefinitionId: TypeSpec.string
      doc: A duration/time period. e.g 5s, 10h
      crossLanguageDefinitionId: TypeSpec.duration
    name: duration
    isGeneratedName: false
    optional: true
    isApiVersionParam: false
    onClient: false
    crossLanguageDefinitionId: TspTest.Builtin.Builtin.duration
    decorators: []
    visibility:
      - 1
      - 2
      - 4
      - 8
      - 16
    access: public
    kind: property
    discriminator: false
    serializedName: duration
    isMultipartFileInput: false
    flatten: false
    serializationOptions: {}
  - apiVersions: []
    type:
      kind: plainDate
      decorators: []
      name: plainDate
      doc: A date on a calendar without a time zone, e.g. "April 10th"
      crossLanguageDefinitionId: TypeSpec.plainDate
    name: date
    isGeneratedName: false
    optional: false
    isApiVersionParam: false
    onClient: false
    crossLanguageDefinitionId: TspTest.Builtin.Builtin.date
    decorators: []
    visibility:
      - 1
      - 2
      - 4
      - 8
      - 16
    access: public
    kind: property
    discriminator: false
    serializedName: date
    isMultipartFileInput: false
    flatten: false
    serializationOptions: {}
  - apiVersions: []
    type:
      kind: utcDateTime
      decorators: []
      name: utcDateTime
      encode: rfc3339
      wireType:
        kind: string
        decorators: []
        name: string
        doc: A sequence of textual characters.
        crossLanguageDefinitionId: TypeSpec.string
      doc: An instant in coordinated universal time (UTC)"
      crossLanguageDefinitionId: TypeSpec.utcDateTime
    name: dateTime
    isGeneratedName: false
    optional: true
    isApiVersionParam: false
    onClient: false
    crossLanguageDefinitionId: TspTest.Builtin.Builtin.dateTime
    decorators: []
    visibility:
      - 1
      - 2
      - 4
      - 8
      - 16
    access: public
    kind: property
    discriminator: false
    serializedName: dateTime
    isMultipartFileInput: false
    flatten: false
    serializationOptions: {}
  - apiVersions: []
    type:
      kind: array
      decorators: []
      name: Array
      valueType:
        kind: string
        decorators: []
        name: string
        doc: A sequence of textual characters.
        crossLanguageDefinitionId: TypeSpec.string
      crossLanguageDefinitionId: TypeSpec.Array
    name: stringList
    isGeneratedName: false
    optional: true
    isApiVersionParam: false
    onClient: false
    crossLanguageDefinitionId: TspTest.Builtin.Builtin.stringList
    decorators: []
    visibility:
      - 1
      - 2
      - 4
      - 8
      - 16
    access: public
    kind: property
    discriminator: false
    serializedName: stringList
    isMultipartFileInput: false
    flatten: false
    serializationOptions: {}
  - apiVersions: []
    type:
      kind: dict
      decorators: []
      keyType:
        kind: string
        decorators: []
        name: string
        doc: A sequence of textual characters.
        crossLanguageDefinitionId: TypeSpec.string
      valueType:
        kind: bytes
        decorators: []
        name: bytes
        doc: Represent a byte array
        crossLanguageDefinitionId: TypeSpec.bytes
        encode: base64
    name: bytesDict
    isGeneratedName: false
    optional: true
    isApiVersionParam: false
    onClient: false
    crossLanguageDefinitionId: TspTest.Builtin.Builtin.bytesDict
    decorators: []
    visibility:
      - 1
      - 2
      - 4
      - 8
      - 16
    access: public
    kind: property
    discriminator: false
    serializedName: bytesDict
    isMultipartFileInput: false
    flatten: false
    serializationOptions: {}
  - apiVersions: []
    type:
      kind: url
      decorators: []
      name: url
      doc: Represent a URL string as described by https://url.spec.whatwg.org/
      crossLanguageDefinitionId: TypeSpec.url
    name: url
    isGeneratedName: false
    optional: false
    isApiVersionParam: false
    onClient: false
    crossLanguageDefinitionId: TspTest.Builtin.Builtin.url
    decorators: []
    visibility:
      - 1
      - 2
      - 4
      - 8
      - 16
    access: public
    kind: property
    discriminator: false
    serializedName: url
    isMultipartFileInput: false
    flatten: false
    serializationOptions: {}
  - apiVersions: []
    type:
      kind: dict
      decorators: []
      keyType:
        kind: string
        decorators: []
        name: string
        doc: A sequence of textual characters.
        crossLanguageDefinitionId: TypeSpec.string
      valueType:
        kind: nullable
        decorators: []
        name: BuiltinNullableFloatDict
        isGeneratedName: true
        crossLanguageDefinitionId: TspTest.Builtin.Builtin.nullableFloatDict.anonymous
        type:
          kind: float64
          decorators: []
          name: float64
          doc: A 64 bit floating point number. (\`±5.0 × 10^−324\` to \`±1.7 × 10^308\`)
          crossLanguageDefinitionId: TypeSpec.float64
        access: public
        usage: 6
        namespace: TspTest.Builtin
    name: nullableFloatDict
    isGeneratedName: false
    optional: false
    isApiVersionParam: false
    onClient: false
    crossLanguageDefinitionId: TspTest.Builtin.Builtin.nullableFloatDict
    decorators: []
    visibility:
      - 1
      - 2
      - 4
      - 8
      - 16
    access: public
    kind: property
    discriminator: false
    serializedName: nullableFloatDict
    isMultipartFileInput: false
    flatten: false
    serializationOptions: {}
access: public
usage: 6
crossLanguageDefinitionId: TspTest.Builtin.Builtin
apiVersions: []
serializationOptions: {}
`;

const EXAMPLE_JAVA = `// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// Code generated by Microsoft (R) TypeSpec Code Generator.

package tsptest.builtin.models;

import com.azure.core.annotation.Fluent;
import com.azure.core.annotation.Generated;
import com.azure.core.util.CoreUtils;
import com.azure.json.JsonReader;
import com.azure.json.JsonSerializable;
import com.azure.json.JsonToken;
import com.azure.json.JsonWriter;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * The Builtin model.
 */
@Fluent
public final class Builtin implements JsonSerializable<Builtin> {
    /*
     * The boolean property.
     */
    @Generated
    private final boolean booleanProperty;

    /*
     * The string property.
     */
    @Generated
    private final String string;

    /*
     * The bytes property.
     */
    @Generated
    private final byte[] bytes;

    /*
     * The int property.
     */
    @Generated
    private final int intProperty;

    /*
     * The safeint property.
     */
    @Generated
    private final long safeint;

    /*
     * The decimal property.
     */
    @Generated
    private final BigDecimal decimal;

    /*
     * The long property.
     */
    @Generated
    private final long longProperty;

    /*
     * The float property.
     */
    @Generated
    private final double floatProperty;

    /*
     * The double property.
     */
    @Generated
    private Double doubleProperty;

    /*
     * The duration property.
     */
    @Generated
    private Duration duration;

    /*
     * The date property.
     */
    @Generated
    private final LocalDate date;

    /*
     * The dateTime property.
     */
    @Generated
    private OffsetDateTime dateTime;

    /*
     * The stringList property.
     */
    @Generated
    private List<String> stringList;

    /*
     * The bytesDict property.
     */
    @Generated
    private Map<String, byte[]> bytesDict;

    /*
     * The url property.
     */
    @Generated
    private final String url;

    /*
     * The nullableFloatDict property.
     */
    @Generated
    private final Map<String, Double> nullableFloatDict;

    /**
     * Creates an instance of Builtin class.
     * 
     * @param booleanProperty the booleanProperty value to set.
     * @param string the string value to set.
     * @param bytes the bytes value to set.
     * @param intProperty the intProperty value to set.
     * @param safeint the safeint value to set.
     * @param decimal the decimal value to set.
     * @param longProperty the longProperty value to set.
     * @param floatProperty the floatProperty value to set.
     * @param date the date value to set.
     * @param url the url value to set.
     * @param nullableFloatDict the nullableFloatDict value to set.
     */
    @Generated
    public Builtin(boolean booleanProperty, String string, byte[] bytes, int intProperty, long safeint,
        BigDecimal decimal, long longProperty, double floatProperty, LocalDate date, String url,
        Map<String, Double> nullableFloatDict) {
        this.booleanProperty = booleanProperty;
        this.string = string;
        this.bytes = bytes;
        this.intProperty = intProperty;
        this.safeint = safeint;
        this.decimal = decimal;
        this.longProperty = longProperty;
        this.floatProperty = floatProperty;
        this.date = date;
        this.url = url;
        this.nullableFloatDict = nullableFloatDict;
    }

    /**
     * Get the booleanProperty property: The boolean property.
     * 
     * @return the booleanProperty value.
     */
    @Generated
    public boolean isBooleanProperty() {
        return this.booleanProperty;
    }

    /**
     * Get the string property: The string property.
     * 
     * @return the string value.
     */
    @Generated
    public String getString() {
        return this.string;
    }

    /**
     * Get the bytes property: The bytes property.
     * 
     * @return the bytes value.
     */
    @Generated
    public byte[] getBytes() {
        return CoreUtils.clone(this.bytes);
    }

    /**
     * Get the intProperty property: The int property.
     * 
     * @return the intProperty value.
     */
    @Generated
    public int getIntProperty() {
        return this.intProperty;
    }

    /**
     * Get the safeint property: The safeint property.
     * 
     * @return the safeint value.
     */
    @Generated
    public long getSafeint() {
        return this.safeint;
    }

    /**
     * Get the decimal property: The decimal property.
     * 
     * @return the decimal value.
     */
    @Generated
    public BigDecimal getDecimal() {
        return this.decimal;
    }

    /**
     * Get the longProperty property: The long property.
     * 
     * @return the longProperty value.
     */
    @Generated
    public long getLongProperty() {
        return this.longProperty;
    }

    /**
     * Get the floatProperty property: The float property.
     * 
     * @return the floatProperty value.
     */
    @Generated
    public double getFloatProperty() {
        return this.floatProperty;
    }

    /**
     * Get the doubleProperty property: The double property.
     * 
     * @return the doubleProperty value.
     */
    @Generated
    public Double getDoubleProperty() {
        return this.doubleProperty;
    }

    /**
     * Set the doubleProperty property: The double property.
     * 
     * @param doubleProperty the doubleProperty value to set.
     * @return the Builtin object itself.
     */
    @Generated
    public Builtin setDoubleProperty(Double doubleProperty) {
        this.doubleProperty = doubleProperty;
        return this;
    }

    /**
     * Get the duration property: The duration property.
     * 
     * @return the duration value.
     */
    @Generated
    public Duration getDuration() {
        return this.duration;
    }

    /**
     * Set the duration property: The duration property.
     * 
     * @param duration the duration value to set.
     * @return the Builtin object itself.
     */
    @Generated
    public Builtin setDuration(Duration duration) {
        this.duration = duration;
        return this;
    }

    /**
     * Get the date property: The date property.
     * 
     * @return the date value.
     */
    @Generated
    public LocalDate getDate() {
        return this.date;
    }

    /**
     * Get the dateTime property: The dateTime property.
     * 
     * @return the dateTime value.
     */
    @Generated
    public OffsetDateTime getDateTime() {
        return this.dateTime;
    }

    /**
     * Set the dateTime property: The dateTime property.
     * 
     * @param dateTime the dateTime value to set.
     * @return the Builtin object itself.
     */
    @Generated
    public Builtin setDateTime(OffsetDateTime dateTime) {
        this.dateTime = dateTime;
        return this;
    }

    /**
     * Get the stringList property: The stringList property.
     * 
     * @return the stringList value.
     */
    @Generated
    public List<String> getStringList() {
        return this.stringList;
    }

    /**
     * Set the stringList property: The stringList property.
     * 
     * @param stringList the stringList value to set.
     * @return the Builtin object itself.
     */
    @Generated
    public Builtin setStringList(List<String> stringList) {
        this.stringList = stringList;
        return this;
    }

    /**
     * Get the bytesDict property: The bytesDict property.
     * 
     * @return the bytesDict value.
     */
    @Generated
    public Map<String, byte[]> getBytesDict() {
        return this.bytesDict;
    }

    /**
     * Set the bytesDict property: The bytesDict property.
     * 
     * @param bytesDict the bytesDict value to set.
     * @return the Builtin object itself.
     */
    @Generated
    public Builtin setBytesDict(Map<String, byte[]> bytesDict) {
        this.bytesDict = bytesDict;
        return this;
    }

    /**
     * Get the url property: The url property.
     * 
     * @return the url value.
     */
    @Generated
    public String getUrl() {
        return this.url;
    }

    /**
     * Get the nullableFloatDict property: The nullableFloatDict property.
     * 
     * @return the nullableFloatDict value.
     */
    @Generated
    public Map<String, Double> getNullableFloatDict() {
        return this.nullableFloatDict;
    }

    /**
     * {@inheritDoc}
     */
    @Generated
    @Override
    public JsonWriter toJson(JsonWriter jsonWriter) throws IOException {
        jsonWriter.writeStartObject();
        jsonWriter.writeBooleanField("boolean", this.booleanProperty);
        jsonWriter.writeStringField("string", this.string);
        jsonWriter.writeBinaryField("bytes", this.bytes);
        jsonWriter.writeIntField("int", this.intProperty);
        jsonWriter.writeLongField("safeint", this.safeint);
        jsonWriter.writeNumberField("decimal", this.decimal);
        jsonWriter.writeLongField("long", this.longProperty);
        jsonWriter.writeDoubleField("float", this.floatProperty);
        jsonWriter.writeStringField("date", Objects.toString(this.date, null));
        jsonWriter.writeStringField("url", this.url);
        jsonWriter.writeMapField("nullableFloatDict", this.nullableFloatDict,
            (writer, element) -> writer.writeNumber(element));
        jsonWriter.writeNumberField("double", this.doubleProperty);
        jsonWriter.writeStringField("duration", CoreUtils.durationToStringWithDays(this.duration));
        jsonWriter.writeStringField("dateTime",
            this.dateTime == null ? null : DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(this.dateTime));
        jsonWriter.writeArrayField("stringList", this.stringList, (writer, element) -> writer.writeString(element));
        jsonWriter.writeMapField("bytesDict", this.bytesDict, (writer, element) -> writer.writeBinary(element));
        return jsonWriter.writeEndObject();
    }

    /**
     * Reads an instance of Builtin from the JsonReader.
     * 
     * @param jsonReader The JsonReader being read.
     * @return An instance of Builtin if the JsonReader was pointing to an instance of it, or null if it was pointing to
     * JSON null.
     * @throws IllegalStateException If the deserialized JSON object was missing any required properties.
     * @throws IOException If an error occurs while reading the Builtin.
     */
    @Generated
    public static Builtin fromJson(JsonReader jsonReader) throws IOException {
        return jsonReader.readObject(reader -> {
            boolean booleanProperty = false;
            String string = null;
            byte[] bytes = null;
            int intProperty = 0;
            long safeint = 0L;
            BigDecimal decimal = null;
            long longProperty = 0L;
            double floatProperty = 0.0;
            LocalDate date = null;
            String url = null;
            Map<String, Double> nullableFloatDict = null;
            Double doubleProperty = null;
            Duration duration = null;
            OffsetDateTime dateTime = null;
            List<String> stringList = null;
            Map<String, byte[]> bytesDict = null;
            while (reader.nextToken() != JsonToken.END_OBJECT) {
                String fieldName = reader.getFieldName();
                reader.nextToken();

                if ("boolean".equals(fieldName)) {
                    booleanProperty = reader.getBoolean();
                } else if ("string".equals(fieldName)) {
                    string = reader.getString();
                } else if ("bytes".equals(fieldName)) {
                    bytes = reader.getBinary();
                } else if ("int".equals(fieldName)) {
                    intProperty = reader.getInt();
                } else if ("safeint".equals(fieldName)) {
                    safeint = reader.getLong();
                } else if ("decimal".equals(fieldName)) {
                    decimal = reader.getNullable(nonNullReader -> new BigDecimal(nonNullReader.getString()));
                } else if ("long".equals(fieldName)) {
                    longProperty = reader.getLong();
                } else if ("float".equals(fieldName)) {
                    floatProperty = reader.getDouble();
                } else if ("date".equals(fieldName)) {
                    date = reader.getNullable(nonNullReader -> LocalDate.parse(nonNullReader.getString()));
                } else if ("url".equals(fieldName)) {
                    url = reader.getString();
                } else if ("nullableFloatDict".equals(fieldName)) {
                    nullableFloatDict = reader.readMap(reader1 -> reader1.getNullable(JsonReader::getDouble));
                } else if ("double".equals(fieldName)) {
                    doubleProperty = reader.getNullable(JsonReader::getDouble);
                } else if ("duration".equals(fieldName)) {
                    duration = reader.getNullable(nonNullReader -> Duration.parse(nonNullReader.getString()));
                } else if ("dateTime".equals(fieldName)) {
                    dateTime = reader
                        .getNullable(nonNullReader -> CoreUtils.parseBestOffsetDateTime(nonNullReader.getString()));
                } else if ("stringList".equals(fieldName)) {
                    stringList = reader.readArray(reader1 -> reader1.getString());
                } else if ("bytesDict".equals(fieldName)) {
                    bytesDict = reader.readMap(reader1 -> reader1.getBinary());
                } else {
                    reader.skipChildren();
                }
            }
            Builtin deserializedBuiltin = new Builtin(booleanProperty, string, bytes, intProperty, safeint, decimal,
                longProperty, floatProperty, date, url, nullableFloatDict);
            deserializedBuiltin.doubleProperty = doubleProperty;
            deserializedBuiltin.duration = duration;
            deserializedBuiltin.dateTime = dateTime;
            deserializedBuiltin.stringList = stringList;
            deserializedBuiltin.bytesDict = bytesDict;

            return deserializedBuiltin;
        });
    }
}
`;
