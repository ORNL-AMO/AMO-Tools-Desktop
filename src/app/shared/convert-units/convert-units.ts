import { ConvertValue } from './ConvertValue';

/**
 * Converts `value` between unit abbreviations using {@link ConvertValue}.
 *
 * @param value The value in `from` units. A non-number (`null`, `undefined`, `''`) is treated as empty.
 * @param from Source unit abbreviation, e.g. `'F'`.
 * @param to Destination unit abbreviation, e.g. `'C'`.
 * @returns The converted number, or `value` unchanged when it is empty.
 * @throws Error when either abbreviation is unknown or the units measure different quantities.
 */
export function convertUnits(value: number, from: string, to: string): number {
  if (typeof value !== 'number') {
    return value;
  }
  const converter = new ConvertValue(value, from, to);
  if (converter.hasError) {
    const unknownUnit = converter.origin ? to : from;
    throw new Error(`Unsupported unit '${unknownUnit}' converting from '${from}' to '${to}'`);
  }
  return converter.convertedValue;
}
