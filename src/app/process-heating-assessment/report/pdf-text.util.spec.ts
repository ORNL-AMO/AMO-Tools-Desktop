import { CHEMICAL_FORMULA, EM_DASH, UNIT_SYMBOL } from '../constants/display-text';
import { toPdfText } from './pdf-text.util';

describe('toPdfText', () => {
  it('writes temperature symbols as a degree sign and letter', () => {
    expect(toPdfText(`${UNIT_SYMBOL.fahrenheit} / ${UNIT_SYMBOL.celsius}`)).toBe('\u00B0F / \u00B0C');
  });

  it('writes subscript digits as plain digits', () => {
    expect(toPdfText(`${CHEMICAL_FORMULA.O2}, ${CHEMICAL_FORMULA.H2O}, ${CHEMICAL_FORMULA.CH4}`)).toBe('O2, H2O, CH4');
  });

  it('replaces every occurrence', () => {
    expect(toPdfText(`Btu/(lb-${UNIT_SYMBOL.fahrenheit}) to kJ/(kg-${UNIT_SYMBOL.celsius})`)).toBe('Btu/(lb-\u00B0F) to kJ/(kg-\u00B0C)');
  });

  it('leaves characters the font can draw unchanged', () => {
    const drawable = `${UNIT_SYMBOL.squareFeet} ${UNIT_SYMBOL.cubicMeters} ${EM_DASH} \u00B0F plain`;
    expect(toPdfText(drawable)).toBe(drawable);
  });
});
