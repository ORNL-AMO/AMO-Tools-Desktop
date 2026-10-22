import { computed, inject, Injectable, Signal } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { isEqual } from 'lodash';
import { ChargeMaterialType } from '../../shared/models/phast/losses/chargeMaterial';
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
import { FlueGasFormService, FlueGasType } from '../heat-balance/losses/flue-gas/flue-gas-form.service';
import { GasLeakageFormService } from '../heat-balance/losses/gas-leakage/gas-leakage-form.service';
import { HEAT_SYSTEM_EFFICIENCY_VALIDATORS } from '../heat-balance/losses/heat-system-efficiency/heat-system-efficiency.component';
import { OpeningFormService } from '../heat-balance/losses/opening/opening-form.service';
import { OtherFormService } from '../heat-balance/losses/other/other-form.service';
import { SlagFormService } from '../heat-balance/losses/slag/slag-form.service';
import { WallLossesFormService } from '../heat-balance/losses/wall-losses/wall-losses-form.service';
import { getModificationName } from '../models/modification';
import { PHAST, PhastValid } from '../models/phast';
import { isViewVisibleForConfiguration, LossView } from '../models/views';
import { AssessmentScenario, deriveHeatingEquipmentConfiguration, ProcessHeatingAssessmentService } from './process-heating-assessment.service';
import { ProcessHeatingOperationsFormService } from './process-heating-operations-form.service';
import { ProcessHeatingResultsService } from './process-heating-results.service';

type ValidityKey = Exclude<keyof PhastValid, 'isValid'>;

interface ValidityCheck {
  key: ValidityKey;
  /** Heat balance step the check belongs to; checks for a step hidden by the heating configuration are skipped. */
  view: LossView;
  /** Names the failing step in the alert, matching legacy's "Errors found in ..." lines. */
  label: string;
  isValid: (phast: PHAST, settings: Settings) => boolean;
}

export interface InvalidModification {
  id: string;
  name: string;
  errors: string[];
}

/**
 * Whether a scenario's saved inputs would pass each step's form validation, so results built from
 * them can be trusted. Each check rebuilds the saved entries through the same form services the
 * steps use. Steps hidden by the heating configuration count as valid.
 */
@Injectable()
export class ProcessHeatingValidityService {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly resultsService = inject(ProcessHeatingResultsService);
  private readonly settingsService = inject(SettingsService);
  private readonly operationsFormService = inject(ProcessHeatingOperationsFormService);
  private readonly solidMaterialFormService = inject(SolidMaterialFormService);
  private readonly liquidMaterialFormService = inject(LiquidMaterialFormService);
  private readonly gasMaterialFormService = inject(GasMaterialFormService);
  private readonly flueGasFormService = inject(FlueGasFormService);
  private readonly fixtureFormService = inject(FixtureFormService);
  private readonly wallFormService = inject(WallLossesFormService);
  private readonly coolingFormService = inject(CoolingFormService);
  private readonly atmosphereFormService = inject(AtmosphereFormService);
  private readonly openingFormService = inject(OpeningFormService);
  private readonly leakageFormService = inject(GasLeakageFormService);
  private readonly extendedSurfaceFormService = inject(ExtendedSurfaceFormService);
  private readonly otherFormService = inject(OtherFormService);
  private readonly slagFormService = inject(SlagFormService);
  private readonly energyInputFormService = inject(EnergyInputFormService);
  private readonly exhaustGasFormService = inject(ExhaustGasFormService);
  private readonly energyInputExhaustGasFormService = inject(EnergyInputExhaustGasFormService);
  private readonly auxiliaryPowerFormService = inject(AuxiliaryPowerFormService);

  /** In the order legacy's alert lists them. */
  private readonly checks: ValidityCheck[] = [
    { key: 'operationsValid', view: LossView.OPERATIONS, label: 'Operations', isValid: (phast, settings) => this.operationsFormService.getForm(phast, deriveHeatingEquipmentConfiguration(settings)).valid },
    { key: 'chargeMaterialValid', view: LossView.CHARGE_MATERIAL, label: 'Charge Materials', isValid: phast => this.allValid(phast.losses?.chargeMaterials, material => {
      switch (material.chargeMaterialType) {
        case ChargeMaterialType.Liquid: return this.liquidMaterialFormService.getLiquidChargeMaterialForm(material);
        case ChargeMaterialType.Gas: return this.gasMaterialFormService.getGasChargeMaterialForm(material);
        default: return this.solidMaterialFormService.getSolidChargeMaterialForm(material);
      }
    }) },
    // The flue gas editor and the results read only the first entry; extra imported entries can't be fixed in the UI.
    { key: 'flueGasValid', view: LossView.FLUE_GAS, label: 'Flue Gas', isValid: (phast, settings) => this.allValid(phast.losses?.flueGasLosses?.slice(0, 1), loss =>
      loss.flueGasType === FlueGasType.ByMass
        ? this.flueGasFormService.getFlueGasMassForm(loss, settings)
        : this.flueGasFormService.getFlueGasVolumeForm(loss, settings)) },
    { key: 'fixtureValid', view: LossView.FIXTURE, label: 'Fixture', isValid: phast => this.allValid(phast.losses?.fixtureLosses, loss => this.fixtureFormService.getFixtureForm(loss)) },
    { key: 'wallValid', view: LossView.WALL_LOSSES, label: 'Wall', isValid: phast => this.allValid(phast.losses?.wallLosses, loss => this.wallFormService.getWallLossForm(loss)) },
    { key: 'coolingValid', view: LossView.COOLING, label: 'Cooling', isValid: (phast, settings) => this.allValid(phast.losses?.coolingLosses, loss => this.coolingFormService.getCoolingForm(loss, settings)) },
    { key: 'atmosphereValid', view: LossView.ATMOSPHERE, label: 'Atmosphere', isValid: phast => this.allValid(phast.losses?.atmosphereLosses, loss => this.atmosphereFormService.getAtmosphereForm(loss)) },
    { key: 'openingValid', view: LossView.OPENING, label: 'Opening', isValid: phast => this.allValid(phast.losses?.openingLosses, loss => this.openingFormService.getOpeningForm(loss)) },
    { key: 'leakageValid', view: LossView.GAS_LEAKAGE, label: 'Leakage', isValid: phast => this.allValid(phast.losses?.leakageLosses, loss => this.leakageFormService.getGasLeakageForm(loss)) },
    { key: 'extendedSurfaceValid', view: LossView.EXTENDED_SURFACE, label: 'Extended Surface', isValid: phast => this.allValid(phast.losses?.extendedSurfaces, loss => this.extendedSurfaceFormService.getExtendedSurfaceForm(loss)) },
    { key: 'otherValid', view: LossView.OTHER, label: 'Other', isValid: phast => this.allValid(phast.losses?.otherLosses, loss => this.otherFormService.getOtherForm(loss)) },
    { key: 'slagValid', view: LossView.SLAG, label: 'Slag', isValid: phast => this.allValid(phast.losses?.slagLosses, loss => this.slagFormService.getSlagForm(loss)) },
    { key: 'energyInputValid', view: LossView.ENERGY_INPUT, label: 'Energy Input', isValid: (phast, settings) => this.isEnergyInputValid(phast, settings) },
    { key: 'systemEfficiencyValid', view: LossView.HEAT_SYSTEM_EFFICIENCY, label: 'System Efficiency', isValid: phast => new FormControl(phast.systemEfficiency ?? null, HEAT_SYSTEM_EFFICIENCY_VALIDATORS).valid },
    { key: 'auxPowerValid', view: LossView.AUXILIARY_POWER, label: 'Auxiliary Power', isValid: phast => this.allValid(phast.losses?.auxiliaryPowerLosses, loss => this.auxiliaryPowerFormService.getAuxiliaryPowerForm(loss)) },
    { key: 'inputExhaustValid', view: LossView.ENERGY_INPUT_EXHAUST_GAS, label: 'Energy Input Exhaust Gas', isValid: phast => this.allValid(phast.losses?.energyInputExhaustGasLoss, loss => this.energyInputExhaustGasFormService.getEnergyInputExhaustGasForm(loss)) },
    { key: 'exhaustGasValid', view: LossView.EXHAUST_GAS, label: 'Exhaust Gas', isValid: phast => this.allValid(phast.losses?.exhaustGasEAF, loss => this.exhaustGasFormService.getExhaustGasForm(loss)) },
  ];

  private readonly scenarioValidityCache = new Map<AssessmentScenario, Signal<PhastValid>>();

  /** Assessment Settings step: the settings form's own validation. Built from a copy because the settings service normalizes the object it is given. */
  readonly isAssessmentSettingsValid: Signal<boolean> = computed(() => {
    const settings = this.assessmentService.settingsSignal();
    return !!settings && this.settingsService.getFormFromSettings({ ...settings }).valid;
  });

  /** Modifications with at least one invalid step, in assessment order. */
  readonly invalidModifications: Signal<InvalidModification[]> = computed(() =>
    (this.assessmentService.processHeatingSignal()?.modifications ?? []).flatMap(modification => {
      const validity = this.scenarioValidity(modification.id);
      return validity.isValid ? [] : [{ id: modification.id, name: getModificationName(modification), errors: this.errorLines(validity) }];
    })
  );

  /**
   * @param scenario 'baseline' or a modification id
   * @returns per-step validity of the scenario, recalculated only when its inputs or the settings change
   */
  scenarioValidity(scenario: AssessmentScenario): PhastValid {
    let cached = this.scenarioValidityCache.get(scenario);
    if (!cached) {
      cached = computed(() => this.checkValid(this.assessmentService.scenarioPhastSignal(scenario), this.assessmentService.settingsSignal()), { equal: isEqual });
      this.scenarioValidityCache.set(scenario, cached);
    }
    return cached();
  }

  /**
   * @param phast the scenario's effective inputs
   * @param settings assessment settings; decide which steps apply
   * @returns whether each step's saved inputs pass its form validation. A scenario that doesn't exist is invalid.
   */
  checkValid(phast: PHAST | undefined, settings: Settings): PhastValid {
    const configuration = deriveHeatingEquipmentConfiguration(settings);
    const valid = Object.fromEntries(this.checks.map(check => [
      check.key,
      !phast || !isViewVisibleForConfiguration(check.view, configuration) || check.isValid(phast, settings),
    ])) as Record<ValidityKey, boolean>;
    return { ...valid, isValid: !!phast && Object.values(valid).every(Boolean) };
  }

  private errorLines(validity: PhastValid): string[] {
    return this.checks.filter(check => !validity[check.key]).map(check => `Errors found in ${check.label}`);
  }

  private allValid<T>(losses: T[] | undefined, buildForm: (loss: T) => AbstractControl): boolean {
    return (losses ?? []).every(loss => buildForm(loss).valid);
  }

  /** The electricity input can't fall below what the scenario's other inputs require. */
  private isEnergyInputValid(phast: PHAST, settings: Settings): boolean {
    const losses = phast.losses?.energyInputEAF;
    if (!losses?.length) {
      return true;
    }
    // The legacy EAF results read operating hours, which the Operations check reports as missing
    const results = phast.operatingHours ? this.resultsService.getResults(phast, settings) : undefined;
    const minElectricityInput = this.energyInputFormService.getMinElectricityInput(results, settings);
    return losses.every(loss => {
      const form = this.energyInputFormService.getEnergyInputForm(loss, settings);
      this.energyInputFormService.setMinElectricityInput(form, minElectricityInput);
      return form.valid;
    });
  }
}
