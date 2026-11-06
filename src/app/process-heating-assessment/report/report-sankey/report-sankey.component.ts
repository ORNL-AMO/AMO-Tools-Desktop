import { ChangeDetectionStrategy, Component, computed, inject, signal, Signal } from '@angular/core';
import { PhastValidService } from '../../../phast/phast-valid.service';
import { SankeyScenarioOption } from '../../../shared/sankey/sankey-scenario-picker/sankey-scenario-picker.component';
import { SANKEY_LABEL_STYLE_OPTIONS, SankeyLabelStyle } from '../../sankey/sankey-label-style';
import { providePhastValidService } from '../../sankey/sankey-results.service';
import { ReportSankeyResultsService, ReportSankeyScenario, ReportSankeyUI } from './report-sankey-results.service';

@Component({
  selector: 'app-report-sankey',
  standalone: false,
  templateUrl: './report-sankey.component.html',
  styleUrl: './report-sankey.component.css',
  providers: [{ provide: PhastValidService, useFactory: providePhastValidService }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportSankeyComponent {
  private readonly reportSankeyResultsService = inject(ReportSankeyResultsService);

  readonly reportSankeyUI: Signal<ReportSankeyUI | undefined> = this.reportSankeyResultsService.reportSankeyUI;
  readonly labelStyle = signal<SankeyLabelStyle>('both');
  readonly labelStyleOptions = SANKEY_LABEL_STYLE_OPTIONS;
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
