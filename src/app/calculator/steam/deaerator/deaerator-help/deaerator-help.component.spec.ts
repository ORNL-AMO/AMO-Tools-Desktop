import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { DeaeratorHelpComponent } from './deaerator-help.component';
import { DeaeratorRanges, DeaeratorService } from '../deaerator.service';
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

function makeRanges(): DeaeratorRanges {
  return {
    deaeratorPressureMin: 1,
    deaeratorPressureMax: 2,
    ventRateMin: 3,
    ventRateMax: 4,
    feedwaterMassFlowMin: 5,
    feedwaterMassFlowMax: 6,
    waterPressureMin: 7,
    waterPressureMax: 8,
    waterQuantityValueMin: 9,
    waterQuantityValueMax: 10,
    steamPressureMin: 11,
    steamPressureMax: 12,
    steamQuantityValueMin: 13,
    steamQuantityValueMax: 14
  };
}

const HELP_SECTIONS: Array<{ field: string, heading: string, rangeCells?: Array<string> }> = [
  { field: 'deaeratorPressure', heading: 'Deaerator Pressure', rangeCells: ['1 psig', '2 psig'] },
  { field: 'ventRate', heading: 'Vent Rate', rangeCells: ['3 %', '4 %'] },
  { field: 'feedwaterMassFlow', heading: 'Feedwater Mass Flow', rangeCells: ['5 klb', '6 klb'] },
  { field: 'waterPressure', heading: 'Water Pressure', rangeCells: ['7 psig', '8 psig'] },
  { field: 'waterThermodynamicQuantity', heading: 'Known Variable' },
  { field: 'steamThermodynamicQuantity', heading: 'Known Variable' },
  { field: 'waterQuantityValue', heading: 'Temperature Value', rangeCells: ['9 F', '10 F'] },
  { field: 'steamPressure', heading: 'Steam Pressure', rangeCells: ['11 psig', '12 psig'] },
  { field: 'steamQuantityValue', heading: 'Temperature Value', rangeCells: ['13 F', '14 F'] },
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

describe('DeaeratorHelpComponent', () => {
  let component: DeaeratorHelpComponent;
  let fixture: ComponentFixture<DeaeratorHelpComponent>;
  let deaeratorServiceSpy: jasmine.SpyObj<DeaeratorService>;

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
    deaeratorServiceSpy = jasmine.createSpyObj('DeaeratorService', ['getRangeValues']);
    deaeratorServiceSpy.getRangeValues.and.returnValue(makeRanges());

    await TestBed.configureTestingModule({
      declarations: [DeaeratorHelpComponent, SettingsLabelStubPipe],
      providers: [{ provide: DeaeratorService, useValue: deaeratorServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DeaeratorHelpComponent);
    component = fixture.componentInstance;
    setInputs({ settings: MOCK_SETTINGS, waterThermodynamicQuantity: 0, steamThermodynamicQuantity: 0 });
  });

  describe('initialization', () => {
    it('gets the ranges for the current settings and quantities', () => {
      expect(deaeratorServiceSpy.getRangeValues).toHaveBeenCalledWith(MOCK_SETTINGS, 0, 0);
      expect(component.rangeValues).toEqual(makeRanges());
    });

    it('always renders the calculator help header', () => {
      expect(normalize(fixture.nativeElement.querySelector('h5').textContent)).toContain('Deaerator Help');
    });
  });

  describe('ngOnChanges', () => {
    it('refreshes the ranges when the water quantity changes', () => {
      deaeratorServiceSpy.getRangeValues.calls.reset();
      setInputs({ waterThermodynamicQuantity: 2 });
      expect(deaeratorServiceSpy.getRangeValues).toHaveBeenCalledWith(MOCK_SETTINGS, 0, 2);
    });

    it('refreshes the ranges when the steam quantity changes', () => {
      deaeratorServiceSpy.getRangeValues.calls.reset();
      setInputs({ steamThermodynamicQuantity: 1 });
      expect(deaeratorServiceSpy.getRangeValues).toHaveBeenCalledWith(MOCK_SETTINGS, 1, 0);
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

    it('describes the inlet water for the water known variable', () => {
      setInputs({ currentField: 'waterThermodynamicQuantity' });
      expect(normalize(getSections()[0].textContent)).toContain('the inlet water.');
    });

    it('describes the inlet steam for the steam known variable', () => {
      setInputs({ currentField: 'steamThermodynamicQuantity' });
      expect(normalize(getSections()[0].textContent)).toContain('the inlet steam.');
    });

    [
      { field: 'waterQuantityValue', quantityInput: 'waterThermodynamicQuantity' },
      { field: 'steamQuantityValue', quantityInput: 'steamThermodynamicQuantity' },
    ].forEach(valueField => {
      QUANTITY_HEADINGS.forEach(quantityCase => {
        it(`renders only the ${quantityCase.heading} heading in ${valueField.field} for quantity ${quantityCase.quantity}`, () => {
          setInputs({ currentField: valueField.field, [valueField.quantityInput]: quantityCase.quantity });
          expect(getSectionHeadings()).toEqual([quantityCase.heading]);
        });

        it(`${quantityCase.unit ? 'shows' : 'hides'} the range unit in ${valueField.field} for quantity ${quantityCase.quantity}`, () => {
          setInputs({ currentField: valueField.field, [valueField.quantityInput]: quantityCase.quantity });
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

      it(`renders no quantity heading in ${valueField.field} for an unknown quantity`, () => {
        setInputs({ currentField: valueField.field, [valueField.quantityInput]: 9 });
        expect(getSectionHeadings()).toEqual(['']);
      });
    });
  });
});
