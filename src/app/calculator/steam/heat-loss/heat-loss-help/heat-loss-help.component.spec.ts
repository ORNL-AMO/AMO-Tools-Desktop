import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { HeatLossHelpComponent } from './heat-loss-help.component';
import { HeatLossRanges, HeatLossService } from '../heat-loss.service';
import { Settings } from '../../../../shared/models/settings';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

const MOCK_SETTINGS = {
  steamPressureMeasurement: 'psig',
  steamTemperatureMeasurement: 'F',
  steamSpecificEnthalpyMeasurement: 'btuLb',
  steamSpecificEntropyMeasurement: 'btulbF',
  steamMassFlowMeasurement: 'klb'
} as Settings;

function makeRanges(): HeatLossRanges {
  return {
    inletPressureMin: 1,
    inletPressureMax: 2,
    quantityValueMin: 3,
    quantityValueMax: 4,
    inletMassFlowMin: 5,
    inletMassFlowMax: 6,
    percentHeatLossMin: 7,
    percentHeatLossMax: 8
  };
}

const HELP_SECTIONS: Array<{ field: string, heading: string, rangeCells?: Array<string> }> = [
  { field: 'inletPressure', heading: 'Inlet Pressure', rangeCells: ['1 psig', '2 psig'] },
  { field: 'thermodynamicQuantity', heading: 'Known Variable' },
  { field: 'quantityValue', heading: 'Temperature Value', rangeCells: ['3 F', '4 F'] },
  { field: 'inletMassFlow', heading: 'Inlet Mass Flow', rangeCells: ['5 klb', '6 klb'] },
  { field: 'percentHeatLoss', heading: 'Percent Heat Loss', rangeCells: ['7 %', '8 %'] },
];

const QUANTITY_HEADINGS: Array<{ quantity: number, heading: string, unit?: string }> = [
  { quantity: 0, heading: 'Temperature Value', unit: 'F' },
  { quantity: 1, heading: 'Specific Enthalpy Value', unit: 'btuLb' },
  { quantity: 2, heading: 'Specific Entropy Value', unit: 'btulbF' },
  { quantity: 3, heading: 'Saturated Quality Value' },
];

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('HeatLossHelpComponent', () => {
  let component: HeatLossHelpComponent;
  let fixture: ComponentFixture<HeatLossHelpComponent>;
  let heatLossServiceSpy: jasmine.SpyObj<HeatLossService>;

  function getSections(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > .my-2'));
  }

  function getHeading(section: HTMLElement): string {
    const heading = section.querySelector('h6').cloneNode(true) as HTMLElement;
    heading.querySelectorAll('small').forEach(small => small.remove());
    return normalize(heading.textContent);
  }

  function getSectionHeadings(): Array<string> {
    return getSections().map(section => getHeading(section));
  }

  function getRangeCells(): Array<HTMLElement> {
    return Array.from(getSections()[0].querySelectorAll('td'));
  }

  function setInputs(inputs: { [key: string]: any }): void {
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    heatLossServiceSpy = jasmine.createSpyObj('HeatLossService', ['getRangeValues']);
    heatLossServiceSpy.getRangeValues.and.returnValue(makeRanges());

    await TestBed.configureTestingModule({
      declarations: [HeatLossHelpComponent, SettingsLabelStubPipe],
      providers: [{ provide: HeatLossService, useValue: heatLossServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HeatLossHelpComponent);
    component = fixture.componentInstance;
    setInputs({ settings: MOCK_SETTINGS, thermodynamicQuantity: 0 });
  });

  describe('initialization', () => {
    it('gets the ranges once for the current settings and quantity', () => {
      expect(heatLossServiceSpy.getRangeValues).toHaveBeenCalledOnceWith(MOCK_SETTINGS, 0);
      expect(component.rangeValues).toEqual(makeRanges());
    });

    it('always renders the calculator help header', () => {
      expect(normalize(fixture.nativeElement.querySelector('h5').textContent)).toContain('Heat Loss Help');
    });
  });

  describe('ngOnChanges', () => {
    it('refreshes the ranges when the quantity changes after the first change', () => {
      heatLossServiceSpy.getRangeValues.calls.reset();
      setInputs({ thermodynamicQuantity: 2 });
      expect(heatLossServiceSpy.getRangeValues).toHaveBeenCalledOnceWith(MOCK_SETTINGS, 2);
    });

    it('does not refresh the ranges when another input changes', () => {
      heatLossServiceSpy.getRangeValues.calls.reset();
      setInputs({ currentField: 'percentHeatLoss' });
      expect(heatLossServiceSpy.getRangeValues).not.toHaveBeenCalled();
    });
  });

  describe('template visibility', () => {
    it('renders no field section when currentField is undefined', () => {
      expect(getSections().length).toBe(0);
    });

    it('renders no field section when currentField matches no section', () => {
      setInputs({ currentField: 'default' });
      expect(getSections().length).toBe(0);
    });

    HELP_SECTIONS.forEach(section => {
      it(`renders only the ${section.field} section when it is the current field`, () => {
        setInputs({ currentField: section.field });
        expect(getSectionHeadings()).toEqual([section.heading]);
        if (section.rangeCells) {
          expect(getRangeCells().map(cell => normalize(cell.textContent))).toEqual(section.rangeCells);
        } else {
          expect(getSections()[0].querySelector('table')).toBeNull();
        }
      });
    });

    QUANTITY_HEADINGS.forEach(quantityCase => {
      it(`renders only the ${quantityCase.heading} heading for quantity ${quantityCase.quantity}`, () => {
        setInputs({ currentField: 'quantityValue', thermodynamicQuantity: quantityCase.quantity });
        expect(getSectionHeadings()).toEqual([quantityCase.heading]);
      });

      it(`${quantityCase.unit ? 'shows' : 'hides'} the range unit for quantity ${quantityCase.quantity}`, () => {
        setInputs({ currentField: 'quantityValue', thermodynamicQuantity: quantityCase.quantity });
        getRangeCells().forEach(cell => {
          const unit = cell.querySelector('span');
          if (quantityCase.unit) {
            expect(normalize(unit.innerHTML)).toBe(quantityCase.unit);
          } else {
            expect(unit).toBeNull();
          }
        });
      });
    });

    it('renders no quantity heading for an unknown quantity', () => {
      setInputs({ currentField: 'quantityValue', thermodynamicQuantity: 9 });
      expect(getSectionHeadings()).toEqual(['']);
    });
  });
});
