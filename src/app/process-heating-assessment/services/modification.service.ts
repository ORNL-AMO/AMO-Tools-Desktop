import { computed, inject, Injectable, Signal } from '@angular/core';
import { getNewIdString } from '../../shared/helperFunctions';
import { ExploreOpportunityCategory, Notes } from '../models/phast';
import { AssessmentView } from '../models/views';
import { isSameEnergySource, ProcessHeatingModification, ScenarioEnergySource, ScenarioOverrides } from '../models/modification';
import { SavingsOpportunity } from '../../shared/models/explore-opps';
import { ProcessHeatingAssessmentService } from './process-heating-assessment.service';
import { ProcessHeatingUiService } from './process-heating-ui.service';
import { getBaselineSnapshot } from './scenario-merge.util';

const EMPTY_NOTES: Notes = {
  chargeNotes: '',
  wallNotes: '',
  atmosphereNotes: '',
  fixtureNotes: '',
  openingNotes: '',
  coolingNotes: '',
  flueGasNotes: '',
  otherNotes: '',
  leakageNotes: '',
  extendedNotes: '',
  slagNotes: '',
  exhaustGasNotes: '',
  energyInputNotes: '',
  energyInputExhaustGasNotes: '',
  heatSystemEfficiencyNotes: '',
  operationsNotes: '',
};

@Injectable()
export class ModificationService {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly uiService = inject(ProcessHeatingUiService);

  readonly modifications: Signal<ProcessHeatingModification[]> = computed(() =>
    this.assessmentService.processHeatingSignal()?.modifications ?? []
  );

  readonly selectedModificationId: Signal<string | undefined> = this.uiService.selectedModificationId;

  readonly selectedModification: Signal<ProcessHeatingModification | undefined> = computed(() =>
    this.modifications().find(modification => modification.id === this.selectedModificationId())
  );

  selectModification(id: string): void {
    this.uiService.activeModificationIdSignal.set(id);
    this.markShownTabVisitedInExpertView();
  }

  addModification(name?: string): string {
    const modifications = this.modifications();
    const id = getNewIdString();
    const modificationName = name ?? this.defaultModificationName();
    const baseline = this.assessmentService.processHeatingSignal();
    const scenarioOverrides: ScenarioOverrides = { name: modificationName, ...getBaselineSnapshot(baseline) };
    if (scenarioOverrides.co2SavingsData) {
      scenarioOverrides.co2SavingsData.userEnteredModificationEmissions = baseline.co2SavingsData?.userEnteredBaselineEmissions;
    }
    const modification: ProcessHeatingModification = { id, scenarioOverrides, notes: { ...EMPTY_NOTES } };
    this.writeModifications([...modifications, modification]);
    this.selectModification(id);
    return id;
  }

  // Single source for the "next scenario" default name, so dialog callers (Explore Opportunities,
  // Expert View) don't each hand-compute the same formula.
  defaultModificationName(): string {
    return `Scenario ${this.modifications().length + 1}`;
  }

  copyModification(id: string): string | undefined {
    const source = this.modifications().find(modification => modification.id === id);
    if (!source) {
      return undefined;
    }
    const newId = getNewIdString();
    const copyName = `${source.scenarioOverrides?.name ?? 'Scenario'} copy`;
    const copy: ProcessHeatingModification = { ...source, id: newId, scenarioOverrides: { ...source.scenarioOverrides, name: copyName } };
    this.writeModifications([...this.modifications(), copy]);
    this.selectModification(newId);
    return newId;
  }

  renameModification(id: string, name: string): void {
    this.assessmentService.updateModificationProperty(id, 'name', name);
  }

  setExploreOpportunityFlag(id: string, category: ExploreOpportunityCategory, value: SavingsOpportunity): void {
    const updated = this.modifications().map(modification =>
      modification.id === id
        ? { ...modification, exploreOpportunityFlags: { ...modification.exploreOpportunityFlags, [category]: value } }
        : modification
    );
    this.writeModifications(updated);
  }

  /**
   * @param id the modification id
   * @param energySource the modification's own energy source; matching the baseline's, or undefined, makes it follow the baseline
   */
  setEnergySource(id: string, energySource: ScenarioEnergySource | undefined): void {
    const baseline = this.assessmentService.settingsSignal();
    const matchesBaseline = !!energySource && !!baseline && isSameEnergySource(energySource, baseline);
    const updated = this.modifications().map(modification =>
      modification.id === id ? { ...modification, energySource: matchesBaseline ? undefined : energySource } : modification
    );
    this.writeModifications(updated);
  }

  setModificationNote(id: string, key: keyof Notes, value: string): void {
    const updated = this.modifications().map(modification =>
      modification.id === id ? { ...modification, notes: { ...modification.notes, [key]: value } } : modification
    );
    this.writeModifications(updated);
  }

  deleteModification(id: string): void {
    const remaining = this.modifications().filter(modification => modification.id !== id);
    this.writeModifications(remaining);
    this.uiService.clearTabsToVisit(id);
    if (this.uiService.activeModificationIdSignal() === id) {
      this.uiService.activeModificationIdSignal.set(remaining[0]?.id);
      this.markShownTabVisitedInExpertView();
    }
  }

  /** Switching modification while on Expert View shows that modification's copy of the selected tab. */
  private markShownTabVisitedInExpertView(): void {
    if (this.uiService.childView() === AssessmentView.EXPERT_VIEW) {
      this.uiService.markShownTabVisited();
    }
  }

  private writeModifications(modifications: ProcessHeatingModification[]): void {
    this.assessmentService.updateProcessHeatingProperty('modifications', modifications);
  }
}
