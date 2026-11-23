import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PrvHelpComponent } from './prv-help.component';
import { FeedwaterRanges, PrvRanges, PrvService } from '../prv.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SharedPipesModule } from '../../../../shared/shared-pipes/shared-pipes.module';
import { Settings } from '../../../../shared/models/settings';
import { SteamImperialDefaults } from '../../../../settings/settings.service';

const MOCK_SETTINGS = { ...SteamImperialDefaults } as Settings;

function makeRanges(): PrvRanges {
  return {
    inletPressureMin: 1, inletPressureMax: 2, quantityValueMin: 3, quantityValueMax: 4,
    inletMassFlowMin: 5, inletMassFlowMax: 6, outletPressureMin: 7, outletPressureMax: 8
  };
}

function makeFeedwaterRanges(): FeedwaterRanges {
  return {
    feedwaterPressureMin: 11, feedwaterPressureMax: 12, feedwaterQuantityValueMin: 13,
    feedwaterQuantityValueMax: 14, desuperheatingTempMin: 15, desuperheatingTempMax: 16
  };
}

const FIELD_HELP: Array<{ field: string, heading: string, cells?: string[] }> = [
  { field: 'inletPressure', heading: 'Inlet Pressure', cells: ['1 psig', '2 psig'] },
  { field: 'thermodynamicQuantity', heading: 'Known Variable' },
  { field: 'inletMassFlow', heading: 'Inlet Mass Flow', cells: ['5 klb/hr', '6 klb/hr'] },
  { field: 'outletPressure', heading: 'Outlet Pressure', cells: ['7 psig', '8 psig'] },
  { field: 'isSuperHeating', heading: 'With or Without Desuperheating' },
  { field: 'feedwaterPressure', heading: 'Feedwater Pressure' },
  { field: 'feedwaterThermodynamicQuantity', heading: 'Known Variable' },
  { field: 'desuperheatingTemp', heading: 'Desuperheating Temperature', cells: ['15 ℉', '16 ℉'] },
];

const QUANTITY_HEADINGS: Array<{ quantity: number, heading: string, feedwaterHeading: string }> = [
  { quantity: 0, heading: 'Temperature', feedwaterHeading: 'Temperature' },
  { quantity: 1, heading: 'Specific Enthalpy', feedwaterHeading: 'Specific Enthalpy' },
  { quantity: 2, heading: 'Specific Entropy', feedwaterHeading: 'Specific entropy' },
  { quantity: 3, heading: 'Saturated Quality', feedwaterHeading: 'Saturated Quality' },
];

describe('PrvHelpComponent', () => {
  let component: PrvHelpComponent;
  let fixture: ComponentFixture<PrvHelpComponent>;
  let prvServiceSpy: jasmine.SpyObj<PrvService>;

  function normalize(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  }

  function sections(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > div.my-2') as NodeListOf<HTMLElement>).slice(1);
  }

  function cells(section: HTMLElement): string[] {
    return Array.from(section.querySelectorAll('td') as NodeListOf<HTMLElement>).map(td => normalize(td.textContent));
  }

  function quantityHeadings(section: HTMLElement): string[] {
    return Array.from(section.querySelectorAll('h6 > div > span') as NodeListOf<HTMLElement>).map(s => s.textContent.trim());
  }

  function createComponent(inputs: { [key: string]: any } = {}): void {
    fixture = TestBed.createComponent(PrvHelpComponent);
    component = fixture.componentInstance;
    const all = { settings: MOCK_SETTINGS, currentField: 'default', thermodynamicQuantity: 0, feedwaterThermodynamicQuantity: 0, isSuperHeating: true, outletPressure: 50, ...inputs };
    Object.keys(all).forEach(key => fixture.componentRef.setInput(key, all[key]));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    prvServiceSpy = jasmine.createSpyObj('PrvService', ['getRangeValues', 'getFeedwaterRangeValues']);
    prvServiceSpy.getRangeValues.and.returnValue(makeRanges());
    prvServiceSpy.getFeedwaterRangeValues.and.returnValue(makeFeedwaterRanges());

    await TestBed.configureTestingModule({
      imports: [SharedPipesModule],
      declarations: [PrvHelpComponent],
      providers: [
        ConvertUnitsService,
        { provide: PrvService, useValue: prvServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('loads the inlet and feedwater ranges', () => {
      createComponent({ thermodynamicQuantity: 1, feedwaterThermodynamicQuantity: 2, outletPressure: 60 });
      expect(prvServiceSpy.getRangeValues).toHaveBeenCalledWith(MOCK_SETTINGS, 1);
      expect(prvServiceSpy.getFeedwaterRangeValues).toHaveBeenCalledWith(MOCK_SETTINGS, 2, 60);
      expect(component.rangeValues).toEqual(makeRanges());
      expect(component.feedwaterRangesValues).toEqual(makeFeedwaterRanges());
    });
  });

  describe('ngOnChanges', () => {
    beforeEach(() => createComponent());

    it('reloads the ranges when the inlet quantity changes', () => {
      prvServiceSpy.getRangeValues.calls.reset();
      fixture.componentRef.setInput('thermodynamicQuantity', 2);
      fixture.detectChanges();
      expect(prvServiceSpy.getRangeValues).toHaveBeenCalledWith(MOCK_SETTINGS, 2);
    });

    it('reloads the ranges when the feedwater quantity changes', () => {
      prvServiceSpy.getFeedwaterRangeValues.calls.reset();
      fixture.componentRef.setInput('feedwaterThermodynamicQuantity', 3);
      fixture.detectChanges();
      expect(prvServiceSpy.getFeedwaterRangeValues).toHaveBeenCalledWith(MOCK_SETTINGS, 3, 50);
    });

    it('does not reload the ranges when only the current field changes', () => {
      prvServiceSpy.getRangeValues.calls.reset();
      fixture.componentRef.setInput('currentField', 'inletPressure');
      fixture.detectChanges();
      expect(prvServiceSpy.getRangeValues).not.toHaveBeenCalled();
    });
  });

  describe('field help', () => {
    it('shows no field help for the default field', () => {
      createComponent();
      expect(sections().length).toBe(0);
    });

    FIELD_HELP.forEach(({ field, heading, cells: expectedCells }) => {
      it(`shows only the ${heading} help when currentField is ${field}`, () => {
        createComponent({ currentField: field });
        const shown = sections();
        expect(shown.length).toBe(1);
        expect(normalize(shown[0].querySelector('h6').textContent).startsWith(heading)).toBeTrue();
        if (expectedCells) {
          expect(cells(shown[0])).toEqual(expectedCells);
        }
      });
    });
  });

  describe('inlet quantity value help', () => {
    QUANTITY_HEADINGS.forEach(({ quantity, heading }) => {
      it(`shows only the ${heading} heading for quantity ${quantity}`, () => {
        createComponent({ currentField: 'quantityValue', thermodynamicQuantity: quantity });
        const shown = sections();
        expect(shown.length).toBe(1);
        expect(quantityHeadings(shown[0])).toEqual([heading]);
      });
    });

    it('shows the range with the temperature unit for quantity 0', () => {
      createComponent({ currentField: 'quantityValue', thermodynamicQuantity: 0 });
      expect(cells(sections()[0])).toEqual(['3 ℉', '4 ℉']);
    });

    it('shows the range without a unit for quality', () => {
      createComponent({ currentField: 'quantityValue', thermodynamicQuantity: 3 });
      expect(cells(sections()[0])).toEqual(['3', '4']);
      expect(sections()[0].querySelectorAll('td span').length).toBe(0);
    });
  });

  describe('feedwater quantity value help', () => {
    QUANTITY_HEADINGS.forEach(({ quantity, feedwaterHeading }) => {
      it(`shows only the ${feedwaterHeading} heading for quantity ${quantity}`, () => {
        createComponent({ currentField: 'feedwaterQuantityValue', feedwaterThermodynamicQuantity: quantity });
        const shown = sections();
        expect(shown.length).toBe(1);
        expect(quantityHeadings(shown[0])).toEqual([feedwaterHeading]);
      });
    });

    it('shows the range with the temperature unit for quantity 0', () => {
      createComponent({ currentField: 'feedwaterQuantityValue', feedwaterThermodynamicQuantity: 0 });
      expect(cells(sections()[0])).toEqual(['13 ℉', '14 ℉']);
    });

    it('shows the range without a unit for quality', () => {
      createComponent({ currentField: 'feedwaterQuantityValue', feedwaterThermodynamicQuantity: 3 });
      expect(cells(sections()[0])).toEqual(['13', '14']);
      expect(sections()[0].querySelectorAll('td span').length).toBe(0);
    });
  });
});
