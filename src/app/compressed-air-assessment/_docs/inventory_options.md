# Inventory Options Documentation

This document describes the compressor and control type options defined in the `inventoryOptions.ts` file. These options are used for configuring compressed air system inventories in the application.

## Compressor Type Options

The following table lists the available compressor types, their values, and associated enum values:

| Value | Label                                         | enumValue | lubricantTypeEnumValue | stageTypeEnumValue |
|-------|-----------------------------------------------|-----------|-----------------------|-------------------|
| 1     | Single stage lubricant-injected rotary screw  | 1         | 0                     | 0                 |
| 2     | Two stage lubricant-injected rotary screw     | 1         | 0                     | 1                 |
| 3     | Two stage lubricant-free rotary screw         | 1         | 1                     | 1                 |
| 4     | Single stage reciprocating                    | 2         | 2                     | 0                 |
| 5     | Two stage reciprocating                       | 2         | 2                     | 1                 |
| 6     | Multiple Stage Centrifugal                    | 0         | 2                     | 2                 |

**Field Descriptions:**
- **value**: Internal value for the compressor type.
- **label**: Human-readable description.
- **enumValue**: Enum value for compressor type logic (used by MEASUR-Tools-Suite).
- **lubricantTypeEnumValue**: Enum value for lubricant type.

### Lubricant Type Enum Values

| lubricantTypeEnumValue | Description         |
|-----------------------|--------------------|
| 0                     | Lubricant-Injected |
| 1                     | Lubricant-Free     |
| 2                     | Other/Not Applicable |

### Stage Type Enum Values

| stageTypeEnumValue | Description        |
|--------------------|-------------------|
| 0                  | Single Stage      |
| 1                  | Two Stage         |
| 2                  | Multiple Stage    |


## Control Type Options

The following table lists the available control types, their values, associated compressor types, and enum values:

| Value | Label                                         | Compressor Types         | enumValue |
|-------|-----------------------------------------------|-------------------------|-----------|
| 1     | Inlet modulation without unloading            | 1, 2                   | 3         |
| 2     | Inlet modulation with unloading               | 1, 2                   | 1         |
| 3     | Variable displacement with unloading          | 1, 2                   | 5         |
| 4     | Load/unload                                   | 1, 2, 3, 4, 5, 6        | 0         |
| 6     | Start/Stop                                    | 1, 2, 3, 4, 5           | 4         |
| 5     | Multi-step unloading                          | 4, 5                    | 6         |
| 7     | Inlet butterfly modulation with blowoff       | 6                       | 2         |
| 8     | Inlet butterfly modulation with unloading     | 6                       | 1         |
| 9     | Inlet guide vane modulation with blowoff      | 6                       | 2         |
| 10    | Inlet guide vane modulation with unloading    | 6                       | 1         |
| 11    | VFD                                          | 1, 2, 3, 4, 5           | 7         |

**Field Descriptions:**
- **value**: Internal value for the control type.
- **label**: Human-readable description.
- **Compressor Types**: List of compressor type values this control type applies to.
- **enumValue**: Enum value for control type logic (used by MEASUR-Tools-Suite).

---
For further details, see the source file: `inventoryOptions.ts`.
