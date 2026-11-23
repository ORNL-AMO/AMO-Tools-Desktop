import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { BoilerHelpComponent } from './boiler-help.component';
import { BoilerRanges, BoilerService } from '../boiler.service';
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

function makeRanges(): BoilerRanges {
  return {
    deaeratorPressureMin: 1,
    deaeratorPressureMax: 2,
    combustionEfficiencyMin: 3,
    combustionEfficiencyMax: 4,
    blowdownRateMin: 5,
    blowdownRateMax: 6,
    steamPressureMin: 7,
    steamPressureMax: 8,
    quantityValueMin: 9,
    quantityValueMax: 10,
    steamMassFlowMin: 11,
    steamMassFlowMax: 12
  };
}

const HELP_SECTIONS: Array<{ field: string, heading: string, rangeCells?: Array<string> }> = [
  { field: 'deaeratorPressure', heading: 'Deaerator Pressure', rangeCells: ['1 psig', '2 psig'] },
  { field: 'combustionEfficiency', heading: 'Combustion Efficiency', rangeCells: ['3 %', '4 %'] },
  { field: 'blowdownRate', heading: 'Blowdown Rate', rangeCells: ['5 %', '6 %'] },
  { field: 'thermodynamicQuantity', heading: 'Known Variable' },
  { field: 'quantityValue', heading: 'Temperature Value', rangeCells: ['9 F', '10 F'] },
  { field: 'steamPressure', heading: 'Steam Pressure', rangeCells: ['7 psig', '8 psig'] },
  { field: 'steamMassFlow', heading: 'Steam Mass Flow', rangeCells: ['11 klb/hr', '12 klb/hr'] },
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

describe('BoilerHelpComponent', () => {
  let component: BoilerHelpComponent;
  let fixture: ComponentFixture<BoilerHelpComponent>;
  let boilerServiceSpy: jasmine.SpyObj<BoilerService>;

  // The first .my-2 block is the always-visible intro; field sections follow it.
  function getFieldSections(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > .my-2')).slice(1) as Array<HTMLElement>;
  }

  function getHeading(section: HTMLElement): string {
    const heading = section.querySelector('h6').cloneNode(true) as HTMLElement;
    heading.querySelectorAll('small').forEach(small => small.remove());
    return normalize(heading.textContent);
  }

  function getSectionHeadings(): Array<string> {
    return getFieldSections().map(section => getHeading(section));
  }

  function getRangeCells(): Array<HTMLElement> {
    return Array.from(getFieldSections()[0].querySelectorAll('td'));
  }

  function setInputs(inputs: { [key: string]: any }): void {
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    boilerServiceSpy = jasmine.createSpyObj('BoilerService', ['getRangeValues']);
    boilerServiceSpy.getRangeValues.and.returnValue(makeRanges());

    await TestBed.configureTestingModule({
      declarations: [BoilerHelpComponent, SettingsLabelStubPipe],
      providers: [{ provide: BoilerService, useValue: boilerServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BoilerHelpComponent);
    component = fixture.componentInstance;
    setInputs({ settings: MOCK_SETTINGS, thermodynamicQuantity: 0 });
  });

  describe('initialization', () => {
    it('gets the ranges once for the current settings and quantity', () => {
      expect(boilerServiceSpy.getRangeValues).toHaveBeenCalledOnceWith(MOCK_SETTINGS, 0);
      expect(component.rangeValues).toEqual(makeRanges());
    });

    it('always renders the calculator help header and intro', () => {
      expect(normalize(fixture.nativeElement.querySelector('h5').textContent)).toContain('Boiler Help');
      expect(fixture.nativeElement.querySelectorAll('.help-info > .my-2').length).toBe(1);
    });
  });

  describe('ngOnChanges', () => {
    it('refreshes the ranges when the quantity changes after the first change', () => {
      boilerServiceSpy.getRangeValues.calls.reset();
      setInputs({ thermodynamicQuantity: 2 });
      expect(boilerServiceSpy.getRangeValues).toHaveBeenCalledOnceWith(MOCK_SETTINGS, 2);
    });

    it('does not refresh the ranges when another input changes', () => {
      boilerServiceSpy.getRangeValues.calls.reset();
      setInputs({ currentField: 'blowdownRate' });
      expect(boilerServiceSpy.getRangeValues).not.toHaveBeenCalled();
    });
  });

  describe('template visibility', () => {
    it('renders no field section when currentField is undefined', () => {
      expect(getFieldSections().length).toBe(0);
    });

    it('renders no field section when currentField matches no section', () => {
      setInputs({ currentField: 'default' });
      expect(getFieldSections().length).toBe(0);
    });

    HELP_SECTIONS.forEach(section => {
      it(`renders only the ${section.field} section when it is the current field`, () => {
        setInputs({ currentField: section.field });
        expect(getSectionHeadings()).toEqual([section.heading]);
        if (section.rangeCells) {
          expect(getRangeCells().map(cell => normalize(cell.textContent))).toEqual(section.rangeCells);
        } else {
          expect(getFieldSections()[0].querySelector('table')).toBeNull();
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
