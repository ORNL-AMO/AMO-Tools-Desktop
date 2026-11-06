import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnergyEquivalencyService } from '../../calculator/furnaces/energy-equivalency/energy-equivalency.service';
import { EnergyUseService } from '../../calculator/furnaces/energy-use/energy-use.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { UnitConverterService } from '../../calculator/utilities/unit-converter/unit-converter.service';
import { CalculatorsComponent } from './calculators.component';

describe('CalculatorsComponent', () => {
  let fixture: ComponentFixture<CalculatorsComponent>;

  const text = (): string => fixture.nativeElement.textContent.replace(/\s+/g, ' ');

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CalculatorsComponent],
      providers: [UnitConverterService, EnergyUseService, EnergyEquivalencyService, { provide: ConvertUnitsService, useValue: {} }],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(CalculatorsComponent);
    fixture.detectChanges();
  });

  it('renders every calculator sub-tab', () => {
    ['O2 Enrichment', 'Fuel to Electricity Equivalency', 'Orifice Meter Flow', 'Unit Converter']
      .forEach(label => expect(text()).toContain(label));
  });

  it('toggles the mobile tab list', () => {
    const mobileList = (): Element | null => fixture.nativeElement.querySelector('.d-lg-none ul.tabs');
    expect(mobileList()).toBeNull();

    fixture.componentInstance.toggleMobileTabs();
    fixture.detectChanges();
    expect(mobileList()).not.toBeNull();

    fixture.componentInstance.closeMobileTabs();
    fixture.detectChanges();
    expect(mobileList()).toBeNull();
  });

  it('gives each visit its own calculator service state', () => {
    const first = fixture.debugElement.injector.get(UnitConverterService);
    first.value1 = 42;
    first.measure = 'length';

    const second = TestBed.createComponent(CalculatorsComponent).debugElement.injector.get(UnitConverterService);

    expect(second).not.toBe(first);
    expect(second.value1).toBeUndefined();
    expect(second.measure).toBeUndefined();
    expect(TestBed.inject(UnitConverterService)).not.toBe(first);
  });

  it('scopes the energy calculator services to the component', () => {
    const injector = fixture.debugElement.injector;

    expect(injector.get(EnergyUseService)).not.toBe(TestBed.inject(EnergyUseService));
    expect(injector.get(EnergyEquivalencyService)).not.toBe(TestBed.inject(EnergyEquivalencyService));
  });
});
