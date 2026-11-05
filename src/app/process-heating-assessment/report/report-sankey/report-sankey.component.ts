import { ChangeDetectionStrategy, Component, computed, inject, signal, Signal } from '@angular/core';
import { PhastValidService } from '../../../phast/phast-valid.service';
import { PHAST as SharedPHAST, PhastValid as SharedPhastValid } from '../../../shared/models/phast/phast';
import { ProcessHeatingValidityService } from '../../services/process-heating-validity.service';
import { SankeyScenarioOption } from '../../../shared/sankey/sankey-scenario-picker/sankey-scenario-picker.component';
import { ReportSankeyResultsService, ReportSankeyScenario, ReportSankeyUI } from './report-sankey-results.service';

export type SankeyLabelStyle = 'percent' | 'power' | 'both';

/**
 * The shared sankey checks its input's validity itself, so it gets this module's cached scenario validity in place of legacy's.
 * Its input is the scenario's own `phast` copy, which identifies the scenario.
 */
function providePhastValidService(): Pick<PhastValidService, 'checkValid'> {
  const validityService = inject(ProcessHeatingValidityService);
  const reportSankeyResultsService = inject(ReportSankeyResultsService);
  return {
    checkValid: (phast: SharedPHAST): SharedPhastValid => {
      const scenario = reportSankeyResultsService.reportSankeyUI().scenarios.find(entry => entry.phast === phast);
      return validityService.scenarioValidity(scenario.id);
    },
  };
}

@Component({
  selector: 'app-report-sankey',
  standalone: false,
  templateUrl: './report-sankey.component.html',
  providers: [{ provide: PhastValidService, useFactory: providePhastValidService }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportSankeyComponent {
  private readonly reportSankeyResultsService = inject(ReportSankeyResultsService);

  readonly reportSankeyUI: Signal<ReportSankeyUI | undefined> = this.reportSankeyResultsService.reportSankeyUI;
  readonly labelStyle = signal<SankeyLabelStyle>('both');
  readonly labelStyleOptions: Array<{ style: SankeyLabelStyle; label: string }> = [
    { style: 'percent', label: 'Loss Percent' },
    { style: 'power', label: 'Loss Power' },
    { style: 'both', label: 'Both' },
  ];
  /** Overrides by picker position; pickers default to showing their own scenario */
  private readonly selectedIds = signal<Record<number, string>>({});

  /** Picker dropdown options, one per scenario. A stable reference, since the picker re-renders its options when the array changes. */
  readonly pickerOptions: Signal<SankeyScenarioOption[]> = computed(() =>
    this.reportSankeyUI()?.scenarios.map(scenario => ({ name: scenario.name, value: scenario.id })) ?? []
  );

  /** @returns the scenario shown by the picker at the given position */
  getScenario(ui: ReportSankeyUI, index: number): ReportSankeyScenario {
    return ui.scenarios.find(scenario => scenario.id === this.selectedIds()[index]) ?? ui.scenarios[index];
  }

  selectScenario(index: number, id: string): void {
    this.selectedIds.update(selected => ({ ...selected, [index]: id }));
  }
}
