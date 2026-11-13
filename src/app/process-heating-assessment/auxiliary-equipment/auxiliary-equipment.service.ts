import { inject, Injectable, Signal } from '@angular/core';
import { AuxiliaryEquipmentItem } from '../../shared/models/phast/auxEquipment';
import { Settings } from '../../shared/models/settings';
import { ItemFormListService, LossFormItem } from '../heat-balance/losses/loss-form-list.service';
import { AssessmentScenario } from '../services/process-heating-assessment.service';
import { AuxiliaryEquipmentResultsService } from '../services/auxiliary-equipment-results.service';
import { AuxiliaryEquipmentForm, AuxiliaryEquipmentFormService, newAuxiliaryEquipmentItem } from './auxiliary-equipment-form.service';

/** Annual hours used when the scenario has no operating hours. */
const DEFAULT_HOURS_PER_YEAR = 8760;

/** `heatLoss` holds the item's power (kW) while it is being edited; it is not saved. */
export type AuxiliaryEquipmentFormItem = LossFormItem<AuxiliaryEquipmentForm>;

@Injectable()
export class AuxiliaryEquipmentService extends ItemFormListService<AuxiliaryEquipmentItem, AuxiliaryEquipmentForm> {
  private readonly formService = inject(AuxiliaryEquipmentFormService);
  private readonly resultsService = inject(AuxiliaryEquipmentResultsService);

  readonly equipment: Signal<AuxiliaryEquipmentFormItem[]> = this.items;

  /**
   * A modification still following baseline's items gets its own copy once shown, so a later baseline edit
   * can't leave its open form out of date.
   */
  override initialize(scenario: AssessmentScenario = 'baseline'): void {
    super.initialize(scenario);
    if (scenario !== 'baseline' && !this.hasOwnEquipment(scenario)) {
      this.writeItems(scenario, this.readItems(scenario) ?? []);
    }
  }

  private hasOwnEquipment(modificationId: string): boolean {
    const modifications = this.assessmentService.getModifications(this.assessmentService.processHeatingSignal());
    return modifications.find(modification => modification.id === modificationId)?.scenarioOverrides?.auxiliaryEquipment !== undefined;
  }

  protected readItems(scenario: AssessmentScenario): AuxiliaryEquipmentItem[] | undefined {
    return this.assessmentService.scenarioPhastSignal(scenario)?.auxiliaryEquipment;
  }

  protected writeItems(scenario: AssessmentScenario, items: AuxiliaryEquipmentItem[]): void {
    const equipment = items.map(({ heatLoss, ...item }: AuxiliaryEquipmentItem & { heatLoss?: number }) => item);
    if (scenario === 'baseline') {
      this.assessmentService.updateProcessHeatingProperty('auxiliaryEquipment', equipment);
    } else {
      this.assessmentService.updateModificationProperty(scenario, 'auxiliaryEquipment', equipment);
    }
  }

  protected override newLoss(): AuxiliaryEquipmentItem {
    const hoursPerYear = this.assessmentService.scenarioPhastSignal(this.scenario())?.operatingHours?.hoursPerYear ?? DEFAULT_HOURS_PER_YEAR;
    const isImperial = this.assessmentService.settingsSignal()?.unitsOfMeasure === 'Imperial';
    // id is assigned by add() and name by defaultName()
    return newAuxiliaryEquipmentItem(hoursPerYear, isImperial) as AuxiliaryEquipmentItem;
  }

  protected override defaultName(index: number): string {
    return `Equipment #${index}`;
  }

  protected buildForm(item: AuxiliaryEquipmentItem): AuxiliaryEquipmentForm {
    return this.formService.getForm(item);
  }

  protected buildLoss(form: AuxiliaryEquipmentForm): AuxiliaryEquipmentItem {
    // id and name are added on save
    return this.formService.buildItem(form) as AuxiliaryEquipmentItem;
  }

  protected calculateResult(form: AuxiliaryEquipmentForm, settings: Settings): number {
    const item = { ...this.formService.buildItem(form), id: '', name: '' };
    return this.resultsService.getResults([item], settings).totalPower;
  }
}
