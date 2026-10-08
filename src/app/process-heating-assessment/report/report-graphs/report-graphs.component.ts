import { ChangeDetectionStrategy, Component, computed, inject, signal, Signal } from '@angular/core';
import { ReportGraphsResultsService, ReportGraphsScenario, ReportGraphsUI } from './report-graphs-results.service';

interface BarChartData {
  name: string;
  barChartLabels: string[];
  barChartValues: number[];
}

@Component({
  selector: 'app-report-graphs',
  standalone: false,
  templateUrl: './report-graphs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportGraphsComponent {
  private readonly reportGraphsResultsService = inject(ReportGraphsResultsService);

  readonly reportGraphsUI: Signal<ReportGraphsUI | undefined> = this.reportGraphsResultsService.reportGraphsUI;
  readonly baselineSelection = signal('baseline');
  readonly modificationSelection = signal<string | undefined>(undefined);

  readonly baselineScenario: Signal<ReportGraphsScenario | undefined> = computed(() => this.findScenario(this.baselineSelection()));
  /** Defaults to the first modification until the user picks another scenario */
  readonly modificationScenario: Signal<ReportGraphsScenario | undefined> = computed(() => {
    const scenarios = this.reportGraphsUI()?.scenarios ?? [];
    return this.findScenario(this.modificationSelection()) ?? scenarios[1];
  });
  readonly barChartData: Signal<BarChartData[]> = computed(() =>
    [this.baselineScenario(), this.modificationScenario()].filter(Boolean).map(scenario => ({
      name: scenario.name,
      barChartLabels: scenario.lossValuesAndLabels.map(item => item.label),
      barChartValues: scenario.lossValuesAndLabels.map(item => item.value),
    }))
  );

  private findScenario(id: string | undefined): ReportGraphsScenario | undefined {
    return this.reportGraphsUI()?.scenarios.find(scenario => scenario.id === id);
  }
}
