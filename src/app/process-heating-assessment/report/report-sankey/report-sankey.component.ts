import { ChangeDetectionStrategy, Component, inject, signal, Signal } from '@angular/core';
import { PhastValidService } from '../../../phast/phast-valid.service';
import { PhastValid } from '../../../shared/models/phast/phast';
import { SankeyScenarioOption } from '../../../shared/sankey/sankey-scenario-picker/sankey-scenario-picker.component';
import { ReportSankeyResultsService, ReportSankeyScenario, ReportSankeyUI } from './report-sankey-results.service';

export type SankeyLabelStyle = 'percent' | 'power' | 'both';

/**
 * Report results are shown for every scenario, so the shared sankey's legacy validity check always passes.
 * Stand-in until this module has its own validity service; replace this provider with that check.
 */
const ALWAYS_VALID: Pick<PhastValidService, 'checkValid'> = {
  checkValid: () => ({ isValid: true } as PhastValid),
};

@Component({
  selector: 'app-report-sankey',
  standalone: false,
  templateUrl: './report-sankey.component.html',
  providers: [{ provide: PhastValidService, useValue: ALWAYS_VALID }],
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

  /** @returns the picker dropdown options, one per scenario */
  getOptions(ui: ReportSankeyUI): SankeyScenarioOption[] {
    return ui.scenarios.map(scenario => ({ name: scenario.name, value: scenario.id }));
  }

  /** @returns the scenario shown by the picker at the given position */
  getScenario(ui: ReportSankeyUI, index: number): ReportSankeyScenario {
    return ui.scenarios.find(scenario => scenario.id === this.selectedIds()[index]) ?? ui.scenarios[index];
  }

  selectScenario(index: number, id: string): void {
    this.selectedIds.update(selected => ({ ...selected, [index]: id }));
  }
}
