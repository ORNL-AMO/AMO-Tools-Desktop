import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { Co2SavingsPhastComponent } from './co2-savings-phast.component';
import { Co2SavingsPhastService } from './co2-savings-phast.service';
import { EGridService } from '../../../../shared/helper-services/e-grid.service';
import { LossesService } from '../../losses.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { PhastCo2SavingsData } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', furnaceType: 'Fuel-Fired Furnace' } as Settings;
const US_AVERAGE_RATE = 400;

function makeSavedCo2Data(overrides: Partial<PhastCo2SavingsData> = {}): PhastCo2SavingsData {
  return {
    energyType: 'electricity',
    energySource: 'Natural Gas',
    fuelType: 'Natural Gas',
    totalEmissionOutputRate: US_AVERAGE_RATE,
    totalFuelEmissionOutputRate: 53.06,
    electricityUse: 0,
    eGridRegion: '',
    eGridSubregion: 'U.S. Average',
    totalEmissionOutput: 0,
    userEnteredBaselineEmissions: false,
    userEnteredModificationEmissions: false,
    zipcode: '00000',
    ...overrides,
  };
}

function makeMixedFuelList(): PhastCo2SavingsData[] {
  return [
    { ...makeSavedCo2Data(), energyType: 'fuel', fuelType: 'Natural Gas', percentFuelUsage: 60 },
    { ...makeSavedCo2Data(), energyType: 'fuel', fuelType: 'Propane', percentFuelUsage: 40 },
  ];
}

describe('Co2SavingsPhastComponent', () => {
  let co2Service: Co2SavingsPhastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Co2SavingsPhastComponent],
      imports: [ReactiveFormsModule, ModalModule.forRoot()],
      providers: [
        Co2SavingsPhastService,
        EGridService,
        ConvertUnitsService,
        { provide: LossesService, useValue: jasmine.createSpyObj('LossesService', [], { modalOpen: { next: () => {} } }) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    const eGridService = TestBed.inject(EGridService);
    eGridService.subRegionsByZipcode = [
      { zip: '00000', state: '', subregions: ['U.S. Average'] },
      { zip: '12345', state: '', subregions: ['SUBA', 'SUBB'] },
    ];
    eGridService.co2Emissions = [
      { subregion: 'U.S. Average', co2Emissions: US_AVERAGE_RATE },
      { subregion: 'SUBA', co2Emissions: 500 },
    ];
    co2Service = TestBed.inject(Co2SavingsPhastService);
  });

  function createEditor(co2SavingsData: PhastCo2SavingsData, isBaseline: boolean, idPrefix = ''): {
    fixture: ComponentFixture<Co2SavingsPhastComponent>;
    emitted: jasmine.Spy;
  } {
    const fixture = TestBed.createComponent(Co2SavingsPhastComponent);
    const emitted = jasmine.createSpy('emitUpdateCo2SavingsData');
    fixture.componentInstance.emitUpdateCo2SavingsData.subscribe(emitted);
    fixture.componentRef.setInput('co2SavingsData', co2SavingsData);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('isBaseline', isBaseline);
    fixture.componentRef.setInput('isFormDisabled', false);
    fixture.componentRef.setInput('idPrefix', idPrefix);
    fixture.detectChanges();
    return { fixture, emitted };
  }

  describe('initialization', () => {
    it('builds the form from the incoming data', () => {
      const { fixture } = createEditor(makeSavedCo2Data(), true);
      expect(fixture.componentInstance.form.controls.totalFuelEmissionOutputRate.value).toBe(53.06);
      expect(fixture.componentInstance.form.controls.eGridSubregion.value).toBe('U.S. Average');
    });

    it('does not emit (save) when opened with saved, unchanged data', () => {
      const { emitted } = createEditor(makeSavedCo2Data(), true);
      expect(emitted).not.toHaveBeenCalled();
    });

    it('emits once when opening fills in values the incoming data lacks', () => {
      const { emitted } = createEditor(makeSavedCo2Data({ totalEmissionOutputRate: undefined }), true);
      expect(emitted).toHaveBeenCalledTimes(1);
      expect(emitted.calls.mostRecent().args[0].totalEmissionOutputRate).toBe(US_AVERAGE_RATE);
    });

    it('keeps the saved mixed fuel list', () => {
      const mixedFuels = makeMixedFuelList();
      const { fixture, emitted } = createEditor(makeSavedCo2Data({ otherFuelMixedCO2SavingsData: mixedFuels }), true);
      expect(fixture.componentInstance.co2SavingsData.otherFuelMixedCO2SavingsData).toEqual(mixedFuels);
      expect(emitted).not.toHaveBeenCalled();
    });
  });

  describe('user-triggered actions', () => {
    it('emits on a user edit, carrying the saved mixed fuel list', () => {
      const mixedFuels = makeMixedFuelList();
      const { fixture, emitted } = createEditor(makeSavedCo2Data({ otherFuelMixedCO2SavingsData: mixedFuels }), true);

      fixture.componentInstance.form.controls.totalEmissionOutputRate.setValue(450);
      fixture.componentInstance.setUserEmissionsOutput();

      expect(emitted).toHaveBeenCalledTimes(1);
      const payload: PhastCo2SavingsData = emitted.calls.mostRecent().args[0];
      expect(payload.totalEmissionOutputRate).toBe(450);
      expect(payload.otherFuelMixedCO2SavingsData).toEqual(mixedFuels);
    });

    it('keeps a custom modification emissions rate when the baseline is edited', () => {
      const baseline = createEditor(makeSavedCo2Data(), true, 'baseline_');
      const modification = createEditor(makeSavedCo2Data(), false, 'modification_');

      modification.fixture.componentInstance.form.controls.totalEmissionOutputRate.setValue(999);
      modification.fixture.componentInstance.setUserEmissionsOutput();
      baseline.fixture.componentInstance.form.controls.totalFuelEmissionOutputRate.setValue(60);
      baseline.fixture.componentInstance.calculate();

      expect(modification.fixture.componentInstance.form.controls.totalEmissionOutputRate.value).toBe(999);
      expect(co2Service.modificationCo2SavingsData.getValue().userEnteredModificationEmissions).toBeTrue();
    });
  });

  describe('template ids', () => {
    it('prefixes every control id and label target', () => {
      // A zip code with two subregions renders the subregion select, so every label has a control.
      const { fixture } = createEditor(makeSavedCo2Data({ zipcode: '12345', eGridSubregion: 'SUBA' }), true, 'baseline_');
      const element: HTMLElement = fixture.nativeElement;
      const labels = Array.from(element.querySelectorAll('label[for]'));

      expect(labels.length).toBeGreaterThan(0);
      labels.forEach(label => {
        const target = label.getAttribute('for');
        expect(target.startsWith('baseline_')).withContext(target).toBeTrue();
        expect(element.querySelector(`#${target}`)).withContext(target).not.toBeNull();
      });
    });
  });

  describe('destroy', () => {
    it('stops re-initializing from the shared modification data after destroy', () => {
      const { fixture, emitted } = createEditor(makeSavedCo2Data(), false);
      const initForm = spyOn(fixture.componentInstance, 'initForm').and.callThrough();
      fixture.destroy();
      initForm.calls.reset();
      emitted.calls.reset();

      co2Service.modificationCo2SavingsData.next(makeSavedCo2Data({ zipcode: '12345' }));

      expect(initForm).not.toHaveBeenCalled();
      expect(emitted).not.toHaveBeenCalled();
    });
  });
});
