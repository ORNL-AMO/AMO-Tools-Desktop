import { signal, WritableSignal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FlueGas } from '../../shared/models/phast/losses/flueGas';
import { Settings } from '../../shared/models/settings';
import { SettingsService } from '../../settings/settings.service';
import { AtmosphereFormService } from '../heat-balance/losses/atmosphere/atmosphere-form.service';
import { AuxiliaryPowerFormService } from '../heat-balance/losses/auxiliary-power/auxiliary-power-form.service';
import { GasMaterialFormService } from '../heat-balance/losses/charge-material/gas-form/gas-material-form.service';
import { LiquidMaterialFormService } from '../heat-balance/losses/charge-material/liquid-form/liquid-material-form.service';
import { SolidMaterialFormService } from '../heat-balance/losses/charge-material/solid-form/solid-material-form.service';
import { CoolingFormService } from '../heat-balance/losses/cooling/cooling-form.service';
import { EnergyInputExhaustGasFormService } from '../heat-balance/losses/energy-input-exhaust-gas/energy-input-exhaust-gas-form.service';
import { EnergyInputFormService } from '../heat-balance/losses/energy-input/energy-input-form.service';
import { ExhaustGasFormService } from '../heat-balance/losses/exhaust-gas/exhaust-gas-form.service';
import { ExtendedSurfaceFormService } from '../heat-balance/losses/extended-surface/extended-surface-form.service';
import { FixtureFormService } from '../heat-balance/losses/fixture/fixture-form.service';
import { FlueGasFormService, FlueGasVolumeForm } from '../heat-balance/losses/flue-gas/flue-gas-form.service';
import { GasLeakageFormService } from '../heat-balance/losses/gas-leakage/gas-leakage-form.service';
import { OpeningFormService } from '../heat-balance/losses/opening/opening-form.service';
import { OtherFormService } from '../heat-balance/losses/other/other-form.service';
import { SlagFormService } from '../heat-balance/losses/slag/slag-form.service';
import { WallLossesFormService } from '../heat-balance/losses/wall-losses/wall-losses-form.service';
import { ProcessHeatingModification } from '../models/modification';
import { Losses, PHAST, PhastResults } from '../models/phast';
import { ProcessHeatingAssessmentService } from './process-heating-assessment.service';
import { ProcessHeatingOperationsFormService } from './process-heating-operations-form.service';
import { ProcessHeatingResultsService } from './process-heating-results.service';
import { ProcessHeatingValidityService } from './process-heating-validity.service';

const FUEL_FIRED = { unitsOfMeasure: 'Imperial', energyResultUnit: 'kWh', energySourceType: 'Fuel' } as Settings;
const STEAM = { ...FUEL_FIRED, energySourceType: 'Steam' } as Settings;
const EAF = { ...FUEL_FIRED, energySourceType: 'Electricity', furnaceType: 'Electric Arc Furnace (EAF)' } as Settings;

const OPERATIONS: Pick<PHAST, 'operatingHours' | 'operatingCosts'> = {
  operatingHours: { hoursPerYear: 8000 },
  operatingCosts: { fuelCost: 3, steamCost: 5, electricityCost: 0.1, coalCarbonCost: 1, electrodeCost: 1, otherFuelCost: 1 },
};

const phastWith = (losses: Losses, extra: Partial<PHAST> = {}): PHAST => ({ ...OPERATIONS, losses, ...extra });

describe('ProcessHeatingValidityService', () => {
  let service: ProcessHeatingValidityService;
  let settings: WritableSignal<Settings>;
  let scenarios: Record<string, WritableSignal<PHAST | undefined>>;
  let processHeating: WritableSignal<PHAST>;
  let settingsFormValid: boolean;

  beforeEach(() => {
    settings = signal(FUEL_FIRED);
    scenarios = {
      baseline: signal<PHAST | undefined>(phastWith({})),
      mod1: signal<PHAST | undefined>(phastWith({})),
      mod2: signal<PHAST | undefined>(phastWith({})),
    };
    const modifications: ProcessHeatingModification[] = [
      { id: 'mod1', scenarioOverrides: { name: 'Mod 1' } },
      { id: 'mod2', scenarioOverrides: { name: 'Mod 2' } },
    ];
    processHeating = signal<PHAST>({ modifications });
    settingsFormValid = true;

    TestBed.configureTestingModule({
      providers: [
        ProcessHeatingValidityService,
        ProcessHeatingOperationsFormService,
        SolidMaterialFormService, LiquidMaterialFormService, GasMaterialFormService, FlueGasFormService,
        FixtureFormService, WallLossesFormService, CoolingFormService, AtmosphereFormService, OpeningFormService,
        GasLeakageFormService, ExtendedSurfaceFormService, OtherFormService, SlagFormService, EnergyInputFormService,
        ExhaustGasFormService, EnergyInputExhaustGasFormService, AuxiliaryPowerFormService,
        ConvertUnitsService,
        {
          provide: ProcessHeatingAssessmentService,
          useValue: {
            settingsSignal: settings,
            processHeatingSignal: processHeating,
            scenarioPhastSignal: (scenario: string) => scenarios[scenario](),
          },
        },
        {
          provide: ProcessHeatingResultsService,
          useValue: {
            getResults: (phast: PHAST) => {
              if (!phast.operatingHours) {
                throw new TypeError("Cannot read properties of undefined (reading 'hoursPerYear')");
              }
              return { totalInput: 1000, exothermicHeat: -100, energyInputTotalChemEnergy: 300 } as PhastResults;
            },
          },
        },
        {
          provide: SettingsService,
          useValue: {
            getFormFromSettings: (formSettings: Settings) => {
              formSettings.steamPressureMeasurement = 'psig';
              return { valid: settingsFormValid } as FormGroup;
            },
          },
        },
      ],
    });
    service = TestBed.inject(ProcessHeatingValidityService);
  });

  describe('scenarioValidity', () => {
    it('is valid when a scenario has complete operations and no invalid losses', () => {
      const validity = service.scenarioValidity('baseline');

      expect(validity.isValid).toBeTrue();
      expect(Object.values(validity).every(Boolean)).toBeTrue();
    });

    it('flags only the step with an invalid entry', () => {
      scenarios.mod1.set(phastWith({ wallLosses: [{}] }));

      const validity = service.scenarioValidity('mod1');

      expect(validity.isValid).toBeFalse();
      expect(validity.wallValid).toBeFalse();
      expect(validity.operationsValid).toBeTrue();
      expect(validity.coolingValid).toBeTrue();
    });

    it('flags missing operations', () => {
      scenarios.baseline.set({ losses: {} });

      expect(service.scenarioValidity('baseline').operationsValid).toBeFalse();
    });

    it('ignores steps hidden by the heating configuration', () => {
      scenarios.baseline.set(phastWith({ flueGasLosses: [{}] }));
      settings.set(EAF);

      expect(service.scenarioValidity('baseline').flueGasValid).toBeTrue();

      settings.set(FUEL_FIRED);
      expect(service.scenarioValidity('baseline').flueGasValid).toBeFalse();
    });

    it('validates only the first flue gas entry', () => {
      spyOn(TestBed.inject(FlueGasFormService), 'getFlueGasVolumeForm')
        .and.callFake((loss: FlueGas) => ({ valid: loss.name === 'Complete' }) as FlueGasVolumeForm);

      scenarios.baseline.set(phastWith({ flueGasLosses: [{ name: 'Complete' }, { name: 'Incomplete' }] }));
      expect(service.scenarioValidity('baseline').flueGasValid).toBeTrue();

      scenarios.baseline.set(phastWith({ flueGasLosses: [{ name: 'Incomplete' }, { name: 'Complete' }] }));
      expect(service.scenarioValidity('baseline').flueGasValid).toBeFalse();
    });

    it('requires a heat system efficiency for steam and rejects values out of range', () => {
      settings.set(STEAM);
      expect(service.scenarioValidity('baseline').systemEfficiencyValid).toBeFalse();

      scenarios.baseline.set(phastWith({}, { systemEfficiency: 80 }));
      expect(service.scenarioValidity('baseline').systemEfficiencyValid).toBeTrue();

      scenarios.baseline.set(phastWith({}, { systemEfficiency: 120 }));
      expect(service.scenarioValidity('baseline').systemEfficiencyValid).toBeFalse();
    });

    it('is invalid for a scenario that does not exist', () => {
      scenarios.mod1.set(undefined);

      expect(service.scenarioValidity('mod1').isValid).toBeFalse();
    });

    it('recalculates only the scenario whose inputs changed', () => {
      const baseline = service.scenarioValidity('baseline');
      scenarios.mod1.set(phastWith({ wallLosses: [{}] }));

      expect(service.scenarioValidity('mod1').isValid).toBeFalse();
      expect(service.scenarioValidity('baseline')).toBe(baseline);
    });

    describe('energy input minimum electricity', () => {
      const energyInput = (electricityInput: number): Losses => ({
        energyInputEAF: [{
          naturalGasHeatInput: 0, flowRateInput: 0, coalCarbonInjection: 0, coalHeatingValue: 12000,
          electrodeUse: 0, electrodeHeatingValue: 12000, otherFuels: 0, electricityInput,
        }],
      });

      beforeEach(() => settings.set(EAF));

      it('is invalid below the electricity the scenario requires', () => {
        scenarios.baseline.set(phastWith(energyInput(599)));

        expect(service.scenarioValidity('baseline').energyInputValid).toBeFalse();
      });

      it('reports invalid operations instead of throwing when operating hours are missing', () => {
        scenarios.baseline.set(phastWith(energyInput(600), { operatingHours: undefined }));

        const validity = service.scenarioValidity('baseline');

        expect(validity.operationsValid).toBeFalse();
        expect(validity.isValid).toBeFalse();
      });

      it('is valid at the required electricity', () => {
        scenarios.baseline.set(phastWith(energyInput(600)));

        expect(service.scenarioValidity('baseline').energyInputValid).toBeTrue();
      });
    });
  });

  describe('invalidModifications', () => {
    it('is empty when every modification is valid, even if baseline is not', () => {
      scenarios.baseline.set(phastWith({ wallLosses: [{}] }));

      expect(service.invalidModifications()).toEqual([]);
    });

    it('lists each invalid modification by name with legacy error labels', () => {
      scenarios.mod2.set(phastWith({ wallLosses: [{}], fixtureLosses: [{}] }));

      expect(service.invalidModifications()).toEqual([
        { id: 'mod2', name: 'Mod 2', errors: ['Errors found in Fixture', 'Errors found in Wall'] },
      ]);
    });
  });

  describe('isAssessmentSettingsValid', () => {
    it('follows the settings form validity', () => {
      expect(service.isAssessmentSettingsValid()).toBeTrue();

      settingsFormValid = false;
      settings.set({ ...FUEL_FIRED });

      expect(service.isAssessmentSettingsValid()).toBeFalse();
    });

    it('leaves the assessment settings untouched', () => {
      const original = { ...FUEL_FIRED, steamPressureMeasurement: 'psi' } as Settings;
      settings.set(original);

      service.isAssessmentSettingsValid();

      expect(original.steamPressureMeasurement).toBe('psi');
    });
  });
});
