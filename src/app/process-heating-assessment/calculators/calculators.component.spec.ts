import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Route, Router, RouterModule } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { EnergyEquivalencyService } from '../../calculator/furnaces/energy-equivalency/energy-equivalency.service';
import { EnergyUseService } from '../../calculator/furnaces/energy-use/energy-use.service';
import { O2EnrichmentFormService } from '../../calculator/furnaces/o2-enrichment/o2-enrichment-form.service';
import { O2EnrichmentService } from '../../calculator/furnaces/o2-enrichment/o2-enrichment.service';
import { PhastService } from '../../phast/phast.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { EnrichmentInput } from '../../shared/models/phast/o2Enrichment';
import { Settings } from '../../shared/models/settings';
import { UnitConverterService } from '../../calculator/utilities/unit-converter/unit-converter.service';
import { ROUTE_TOKENS } from '../constants/process-heating-routes';
import { ROUTES } from '../process-heating-assessment.module';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { CalculatorTabComponent } from './calculator-tab.component';
import { CalculatorsComponent } from './calculators.component';

describe('CalculatorsComponent', () => {
  let fixture: ComponentFixture<CalculatorsComponent>;

  const text = (): string => fixture.nativeElement.textContent.replace(/\s+/g, ' ');

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CalculatorsComponent],
      providers: [
        UnitConverterService,
        EnergyUseService,
        EnergyEquivalencyService,
        { provide: ConvertUnitsService, useValue: {} },
        { provide: PhastService, useValue: {} },
      ],
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

  it('starts another assessment on empty O2 Enrichment inputs after one was edited', () => {
    const firstInjector = fixture.debugElement.injector;
    firstInjector.get(O2EnrichmentService).enrichmentInputs.next([{ inputData: { name: 'Edited' } } as EnrichmentInput]);

    const secondInjector = TestBed.createComponent(CalculatorsComponent).debugElement.injector;

    expect(secondInjector.get(O2EnrichmentService)).not.toBe(firstInjector.get(O2EnrichmentService));
    expect(secondInjector.get(O2EnrichmentService).enrichmentInputs.value).toBeUndefined();
    expect(secondInjector.get(O2EnrichmentFormService)).not.toBe(firstInjector.get(O2EnrichmentFormService));
    expect(firstInjector.get(O2EnrichmentFormService)).not.toBe(TestBed.inject(O2EnrichmentFormService));
  });

  it('scopes the energy calculator services to the component', () => {
    const injector = fixture.debugElement.injector;

    expect(injector.get(EnergyUseService)).not.toBe(TestBed.inject(EnergyUseService));
    expect(injector.get(EnergyEquivalencyService)).not.toBe(TestBed.inject(EnergyEquivalencyService));
  });
});

describe('Calculators sub-tab routing', () => {
  let harness: RouterTestingHarness;

  const calculatorsRoute: Route = ROUTES
    .flatMap(route => route.children ?? [])
    .find(route => route.path === ROUTE_TOKENS.calculators);

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [RouterModule],
      declarations: [CalculatorsComponent, CalculatorTabComponent],
      providers: [
        provideRouter([calculatorsRoute]),
        { provide: ConvertUnitsService, useValue: {} },
        { provide: PhastService, useValue: {} },
        {
          provide: ProcessHeatingAssessmentService,
          useValue: { assessmentValue: { id: 1 }, settingsSignal: signal({ unitsOfMeasure: 'Imperial' } as Settings) },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    harness = await RouterTestingHarness.create();
  });

  it('opens O2 Enrichment by default', async () => {
    await harness.navigateByUrl(`/${ROUTE_TOKENS.calculators}`);

    expect(TestBed.inject(Router).url).toBe(`/${ROUTE_TOKENS.calculators}/${ROUTE_TOKENS.o2Enrichment}`);
    expect(harness.routeNativeElement.querySelector('app-o2-enrichment')).not.toBeNull();
  });

  [
    { path: ROUTE_TOKENS.o2Enrichment, selector: 'app-o2-enrichment' },
    { path: ROUTE_TOKENS.fuelElectricityEquivalency, selector: 'app-energy-equivalency' },
    { path: ROUTE_TOKENS.orificeMeter, selector: 'app-energy-use' },
    { path: ROUTE_TOKENS.unitConverter, selector: 'app-unit-converter' },
  ].forEach(({ path, selector }) => {
    it(`shows only ${selector} on the ${path} sub-tab`, async () => {
      await harness.navigateByUrl(`/${ROUTE_TOKENS.calculators}/${path}`);

      const calculators = harness.routeNativeElement.querySelectorAll('app-o2-enrichment, app-energy-equivalency, app-energy-use, app-unit-converter');
      expect(calculators.length).toBe(1);
      expect(calculators[0].tagName.toLowerCase()).toBe(selector);
    });
  });
});
