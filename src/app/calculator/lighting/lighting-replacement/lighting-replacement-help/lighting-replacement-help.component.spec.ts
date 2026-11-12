import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LightingReplacementHelpComponent } from './lighting-replacement-help.component';
import { LightingReplacementService } from '../lighting-replacement.service';
import { LightingFixtureCategory, LightingFixtureData, LightingSuiteApiService } from '../../../../tools-suite-api/lighting-suite-api.service';

const MOCK_CATEGORIES: Array<LightingFixtureCategory> = [
  { category: 0, label: 'Custom', fixturesData: [] },
  { category: 1, label: 'Metal Halide', fixturesData: [] },
  { category: 2, label: 'High Pressure Sodium', fixturesData: [] },
];

function makeFixtureType(type: string): LightingFixtureData {
  return {
    category: 'Metal Halide',
    type: type,
    lampsPerFixture: 1,
    wattsPerLamp: 400,
    lumensPerLamp: 36000,
    lampLife: 20000,
    coefficientOfUtilization: 0.7,
    ballastFactor: 1,
    lumenDegradationFactor: 0.8,
  };
}

// currentField value -> heading text that identifies its help block. 'category' has no heading, only a table.
const HELP_HEADINGS: Array<[field: string, heading: string]> = [
  ['hoursPerYear', 'Hours per Year'],
  ['wattsPerLamp', 'Watts per Lamp'],
  ['lumensPerLamp', 'Lumens per Lamp'],
  ['lampsPerFixture', 'Lamps per Fixture'],
  ['numberOfFixtures', 'Number of Fixtures'],
  ['electricityCost', 'Electricity Cost'],
  ['category', 'Type of Fixture'],
  ['type', 'Lighting Fixture Type'],
  ['ballastFactor', 'Ballast Factor'],
  ['coefficientOfUtilization', 'Coefficient of Utilization'],
  ['lumenDegradationFactor', 'Lumen Degradation Factor'],
];

describe('LightingReplacementHelpComponent', () => {
  let component: LightingReplacementHelpComponent;
  let fixture: ComponentFixture<LightingReplacementHelpComponent>;
  let selectedFixtureTypes: BehaviorSubject<Array<LightingFixtureData>>;
  let suiteApiSpy: jasmine.SpyObj<LightingSuiteApiService>;

  function getFieldHelpBlocks(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > .my-2'));
  }

  function showField(field: string): void {
    fixture.componentRef.setInput('currentField', field);
    fixture.detectChanges();
  }

  function tableCellText(): Array<string> {
    return Array.from(getFieldHelpBlocks()[0].querySelectorAll('td'))
      .map((cell: HTMLElement) => cell.textContent.trim());
  }

  beforeEach(async () => {
    selectedFixtureTypes = new BehaviorSubject<Array<LightingFixtureData>>(undefined);
    suiteApiSpy = jasmine.createSpyObj('LightingSuiteApiService', ['getLightingSystems']);
    suiteApiSpy.getLightingSystems.and.returnValue(MOCK_CATEGORIES);

    const serviceMock = { selectedFixtureTypes } as Partial<LightingReplacementService>;

    await TestBed.configureTestingModule({
      declarations: [LightingReplacementHelpComponent],
      providers: [
        { provide: LightingReplacementService, useValue: serviceMock },
        { provide: LightingSuiteApiService, useValue: suiteApiSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LightingReplacementHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('loads the fixture categories from the suite api', () => {
      expect(suiteApiSpy.getLightingSystems).toHaveBeenCalled();
      expect(component.lightingFixtureCategories).toBe(MOCK_CATEGORIES);
    });
  });

  describe('selectedFixtureTypes observer', () => {
    it('assigns fixture types when the service emits', () => {
      const types = [makeFixtureType('350-W Metal Halide')];
      selectedFixtureTypes.next(types);
      expect(component.fixtureTypes).toBe(types);
    });
  });

  describe('template visibility', () => {
    it('shows no field help block when no field is focused', () => {
      expect(getFieldHelpBlocks().length).toBe(0);
    });

    it('shows no field help block for an unrecognized field', () => {
      showField('someOtherField');
      expect(getFieldHelpBlocks().length).toBe(0);
    });

    HELP_HEADINGS.forEach(([field, heading]) => {
      it(`shows only the ${field} help block when ${field} is focused`, () => {
        showField(field);
        const blocks = getFieldHelpBlocks();
        expect(blocks.length).toBe(1);
        expect(blocks[0].textContent).toContain(heading);
      });
    });

    it('lists one row per fixture category in the category help', () => {
      showField('category');
      expect(tableCellText()).toEqual(['Custom', 'Metal Halide', 'High Pressure Sodium']);
    });

    it('lists one row per selected fixture type in the type help', () => {
      selectedFixtureTypes.next([makeFixtureType('350-W Metal Halide'), makeFixtureType('400-W Metal Halide')]);
      showField('type');
      expect(tableCellText()).toEqual(['350-W Metal Halide', '400-W Metal Halide']);
    });

    it('lists no fixture type rows when no fixture types are selected', () => {
      showField('type');
      expect(tableCellText()).toEqual([]);
    });

    it('updates the fixture type rows when the selected fixture types change', () => {
      selectedFixtureTypes.next([makeFixtureType('350-W Metal Halide')]);
      showField('type');
      selectedFixtureTypes.next([makeFixtureType('LED 100W')]);
      fixture.detectChanges();
      expect(tableCellText()).toEqual(['LED 100W']);
    });
  });

  describe('destroy', () => {
    it('stops updating fixture types after the component is destroyed', () => {
      const initialTypes = [makeFixtureType('350-W Metal Halide')];
      selectedFixtureTypes.next(initialTypes);
      fixture.destroy();
      selectedFixtureTypes.next([makeFixtureType('LED 100W')]);
      expect(component.fixtureTypes).toBe(initialTypes);
    });
  });
});
