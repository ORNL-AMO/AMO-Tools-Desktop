import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { FlashTankHelpComponent } from './flash-tank-help.component';
import { FlashTankRanges, FlashTankService } from '../flash-tank.service';
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

function makeRanges(): FlashTankRanges {
  return {
    inletWaterPressureMin: 1,
    inletWaterPressureMax: 2,
    quantityValueMin: 3,
    quantityValueMax: 4,
    inletWaterMassFlowMin: 5,
    inletWaterMassFlowMax: 6,
    tankPressureMin: 7,
    tankPressureMax: 8
  };
}

const HELP_SECTIONS: Array<{ field: string, heading: string, rangeCells?: Array<string> }> = [
  { field: 'inletWaterPressure', heading: 'Inlet Water Pressure', rangeCells: ['1 psig', '2 psig'] },
  { field: 'thermodynamicQuantity', heading: 'Known Variable' },
  { field: 'quantityValue', heading: 'Temperature Value', rangeCells: ['3 F', '4 F'] },
  { field: 'inletWaterMassFlow', heading: 'Inlet Water Mass Flow', rangeCells: ['5 klb', '6 klb'] },
  { field: 'tankPressure', heading: 'Tank Pressure', rangeCells: ['7 psig', '8 psig'] },
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

describe('FlashTankHelpComponent', () => {
  let component: FlashTankHelpComponent;
  let fixture: ComponentFixture<FlashTankHelpComponent>;
  let flashTankServiceSpy: jasmine.SpyObj<FlashTankService>;

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
    flashTankServiceSpy = jasmine.createSpyObj('FlashTankService', ['getRangeValues']);
    flashTankServiceSpy.getRangeValues.and.returnValue(makeRanges());

    await TestBed.configureTestingModule({
      declarations: [FlashTankHelpComponent, SettingsLabelStubPipe],
      providers: [{ provide: FlashTankService, useValue: flashTankServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FlashTankHelpComponent);
    component = fixture.componentInstance;
    setInputs({ settings: MOCK_SETTINGS, thermodynamicQuantity: 0 });
  });

  describe('initialization', () => {
    it('gets the ranges once for the current settings and quantity', () => {
      expect(flashTankServiceSpy.getRangeValues).toHaveBeenCalledOnceWith(MOCK_SETTINGS, 0);
      expect(component.rangeValues).toEqual(makeRanges());
    });

    it('always renders the calculator help header', () => {
      expect(normalize(fixture.nativeElement.querySelector('h5').textContent)).toContain('Flash Tank Help');
    });
  });

  describe('ngOnChanges', () => {
    it('refreshes the ranges when the quantity changes after the first change', () => {
      flashTankServiceSpy.getRangeValues.calls.reset();
      setInputs({ thermodynamicQuantity: 2 });
      expect(flashTankServiceSpy.getRangeValues).toHaveBeenCalledOnceWith(MOCK_SETTINGS, 2);
    });

    it('does not refresh the ranges when another input changes', () => {
      flashTankServiceSpy.getRangeValues.calls.reset();
      setInputs({ currentField: 'tankPressure' });
      expect(flashTankServiceSpy.getRangeValues).not.toHaveBeenCalled();
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
