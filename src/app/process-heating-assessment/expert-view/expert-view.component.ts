import { ChangeDetectionStrategy, Component, inject, Injector, Signal } from '@angular/core';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { ModificationService } from '../services/modification.service';
import { getModificationName, ProcessHeatingModification } from '../models/modification';
import { AUXILIARY_EQUIPMENT_VIEW, FUEL_SWITCHING_VIEW, isViewVisibleForConfiguration, LossView, ProcessHeatingView, ViewLink } from '../models/views';
import { getEnergySourceLabel } from '../models/energy-source';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { ProcessHeatingValidityService } from '../services/process-heating-validity.service';
import { AddModificationComponent, DEFAULT_DESCRIPTION } from '../../shared/add-modification/add-modification.component';

@Component({
  selector: 'app-expert-view',
  standalone: false,
  templateUrl: './expert-view.component.html',
  styleUrl: './expert-view.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpertViewComponent {
  private readonly modalDialogService = inject(ModalDialogService);
  private readonly injector = inject(Injector);
  private readonly modificationService = inject(ModificationService);
  private readonly uiService = inject(ProcessHeatingUiService);
  private readonly validityService = inject(ProcessHeatingValidityService);
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);

  readonly LossView = LossView;
  readonly AUXILIARY_EQUIPMENT_VIEW = AUXILIARY_EQUIPMENT_VIEW;
  readonly FUEL_SWITCHING_VIEW = FUEL_SWITCHING_VIEW;
  readonly selectedModification: Signal<ProcessHeatingModification | undefined> = this.modificationService.selectedModification;
  readonly tabs: Signal<ViewLink[]> = this.uiService.visibleExpertViewTabs;
  readonly selectedTab: Signal<ProcessHeatingView | undefined> = this.uiService.selectedExpertViewTab;

  constructor() {
    // Returning to Expert View shows the tab selected earlier, which counts as a visit.
    this.uiService.markShownTabVisited();
  }

  selectTab(view: ProcessHeatingView): void {
    this.uiService.selectExpertViewTab(view);
  }

  /** Marks a tab whose step is invalid in the baseline or in the modification, since both are edited here. */
  isTabInvalid(link: ViewLink, modification: ProcessHeatingModification): boolean {
    return !this.validityService.isStepValid('baseline', link.view) || !this.validityService.isStepValid(modification.id, link.view);
  }

  /** Marks a tab the modification's energy source change asks the user to visit. */
  needsVisit(link: ViewLink, modification: ProcessHeatingModification): boolean {
    return this.uiService.isTabToVisit(modification.id, link.view);
  }

  /** @returns the accessible name and tooltip for a marked tab, or null while it needs no attention */
  tabStatusLabel(link: ViewLink, modification: ProcessHeatingModification): string | null {
    if (this.isTabInvalid(link, modification)) {
      return `${link.label}, has invalid inputs`;
    }
    return this.needsVisit(link, modification) ? `${link.label}, review after the energy source change` : null;
  }

  /** Counts the modification's entries, or the baseline's when the tab doesn't apply to the modification's energy source. */
  lossCount(link: ViewLink, modification: ProcessHeatingModification): number | undefined {
    const appliesToModification = isViewVisibleForConfiguration(link.view, this.assessmentService.scenarioConfiguration(modification.id));
    return this.uiService.lossCount(link.view, appliesToModification ? modification.id : 'baseline');
  }

  /**
   * @param scenario 'baseline' or a modification id
   * @param scenarioName the scenario's display name
   * @returns why the selected tab doesn't apply to the scenario's energy source, or undefined when it does
   */
  notApplicableMessage(scenario: AssessmentScenario, scenarioName: string): string | undefined {
    const tab = this.tabs().find(link => link.view === this.selectedTab());
    if (!tab || isViewVisibleForConfiguration(tab.view, this.assessmentService.scenarioConfiguration(scenario))) {
      return undefined;
    }
    const energySource = getEnergySourceLabel(this.assessmentService.scenarioSettings(scenario));
    return `${scenarioName} uses ${energySource}, which does not use ${tab.label}.`;
  }

  modificationName(modification: ProcessHeatingModification): string {
    return getModificationName(modification);
  }

  addModification(): void {
    const hasExistingModifications = this.modificationService.modifications().length > 0;
    this.modalDialogService.openModal(AddModificationComponent, {
      width: '800px',
      data: {
        themeClass: 'process-heating-assessment',
        description: hasExistingModifications ? '' : DEFAULT_DESCRIPTION,
        defaultName: this.modificationService.defaultModificationName(),
        onCreate: (name: string) => this.modificationService.addModification(name),
      },
    }, this.injector);
  }
}
