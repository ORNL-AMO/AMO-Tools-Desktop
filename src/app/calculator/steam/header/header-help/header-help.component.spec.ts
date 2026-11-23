import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HeaderHelpComponent } from './header-help.component';
import { HeaderService, InletRanges } from '../header.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SharedPipesModule } from '../../../../shared/shared-pipes/shared-pipes.module';
import { Settings } from '../../../../shared/models/settings';
import { SteamImperialDefaults } from '../../../../settings/settings.service';

const MOCK_SETTINGS = { ...SteamImperialDefaults } as Settings;

function makeInletRanges(quantityMin: number = 3): InletRanges {
  return { pressureMin: 1, pressureMax: 2, quantityMin: quantityMin, quantityMax: 4, massFlowMin: 5, massFlowMax: 6 };
}

const FIELD_HELP: Array<{ field: string, heading: string, cells?: string[] }> = [
  { field: 'headerPressure', heading: 'Header Pressure', cells: ['10 psig', '20 psig'] },
  { field: 'numInlets', heading: 'Number of Inlets' },
  { field: 'thermodynamicQuantity', heading: 'Known Variable' },
  { field: 'pressure', heading: 'Steam Pressure', cells: ['1 psig', '2 psig'] },
  { field: 'massFlow', heading: 'Inlet Mass Flow', cells: ['5 klb/hr', '6 klb/hr'] },
];

const QUANTITY_HEADINGS: Array<{ quantity: number, heading: string }> = [
  { quantity: 0, heading: 'Temperature' },
  { quantity: 1, heading: 'Specific Enthalpy' },
  { quantity: 2, heading: 'Specific entropy' },
  { quantity: 3, heading: 'Saturated Quality' },
];

describe('HeaderHelpComponent', () => {
  let component: HeaderHelpComponent;
  let fixture: ComponentFixture<HeaderHelpComponent>;
  let headerServiceSpy: jasmine.SpyObj<HeaderService>;

  function normalize(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  }

  function sections(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > div.my-2') as NodeListOf<HTMLElement>);
  }

  function cells(section: HTMLElement): string[] {
    return Array.from(section.querySelectorAll('td') as NodeListOf<HTMLElement>).map(td => normalize(td.textContent));
  }

  function createComponent(currentField: string = 'default', thermodynamicQuantity: number = 0): void {
    fixture = TestBed.createComponent(HeaderHelpComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('currentField', currentField);
    fixture.componentRef.setInput('thermodynamicQuantity', thermodynamicQuantity);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    headerServiceSpy = jasmine.createSpyObj('HeaderService', ['getPressureRangeValues', 'getInletRangeValues']);
    headerServiceSpy.getPressureRangeValues.and.returnValue({ min: 10, max: 20 });
    headerServiceSpy.getInletRangeValues.and.returnValue(makeInletRanges());

    await TestBed.configureTestingModule({
      imports: [SharedPipesModule],
      declarations: [HeaderHelpComponent],
      providers: [
        ConvertUnitsService,
        { provide: HeaderService, useValue: headerServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('loads the pressure and inlet ranges', () => {
      createComponent('default', 1);
      expect(headerServiceSpy.getPressureRangeValues).toHaveBeenCalledWith(MOCK_SETTINGS);
      expect(headerServiceSpy.getInletRangeValues).toHaveBeenCalledWith(MOCK_SETTINGS, 1);
      expect(component.pressureRanges).toEqual({ min: 10, max: 20 });
      expect(component.inletRanges).toEqual(makeInletRanges());
    });
  });

  describe('ngOnChanges', () => {
    it('reloads the inlet ranges when the quantity changes after the first change', () => {
      createComponent();
      headerServiceSpy.getInletRangeValues.calls.reset();
      headerServiceSpy.getInletRangeValues.and.returnValue(makeInletRanges(7));
      fixture.componentRef.setInput('thermodynamicQuantity', 2);
      fixture.detectChanges();
      expect(headerServiceSpy.getInletRangeValues).toHaveBeenCalledWith(MOCK_SETTINGS, 2);
      expect(component.inletRanges.quantityMin).toBe(7);
    });

    it('does not reload the inlet ranges when only the field changes', () => {
      createComponent();
      headerServiceSpy.getInletRangeValues.calls.reset();
      fixture.componentRef.setInput('currentField', 'pressure');
      fixture.detectChanges();
      expect(headerServiceSpy.getInletRangeValues).not.toHaveBeenCalled();
    });
  });

  describe('field help', () => {
    it('shows no field help for the default field', () => {
      createComponent();
      expect(sections().length).toBe(0);
    });

    FIELD_HELP.forEach(({ field, heading, cells: expectedCells }) => {
      it(`shows only the ${heading} help when currentField is ${field}`, () => {
        createComponent(field);
        const shown = sections();
        expect(shown.length).toBe(1);
        expect(normalize(shown[0].querySelector('h6').textContent).startsWith(heading)).toBeTrue();
        if (expectedCells) {
          expect(cells(shown[0])).toEqual(expectedCells);
        }
      });
    });
  });

  describe('quantity value help', () => {
    QUANTITY_HEADINGS.forEach(({ quantity, heading }) => {
      it(`shows only the ${heading} heading for quantity ${quantity}`, () => {
        createComponent('quantityValue', quantity);
        const shown = sections();
        expect(shown.length).toBe(1);
        const headings = Array.from(shown[0].querySelectorAll('h6 > div > span') as NodeListOf<HTMLElement>).map(s => s.textContent.trim());
        expect(headings).toEqual([heading]);
      });
    });

    it('shows the range with the temperature unit for quantity 0', () => {
      createComponent('quantityValue', 0);
      expect(cells(sections()[0])).toEqual(['3 ℉', '4 ℉']);
    });

    it('shows the range without a unit for quality', () => {
      createComponent('quantityValue', 3);
      expect(cells(sections()[0])).toEqual(['3', '4']);
      expect(sections()[0].querySelectorAll('td span').length).toBe(0);
    });
  });
});
