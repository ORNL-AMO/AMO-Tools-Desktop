import { ChangeDetectionStrategy, Component, computed, inject, signal, Signal } from '@angular/core';
import { PhastValidService } from '../../phast/phast-valid.service';
import { Settings } from '../../shared/models/settings';
import { ProcessHeatingValidityService } from '../services/process-heating-validity.service';
import { SANKEY_LABEL_STYLE_OPTIONS, SankeyLabelStyle } from './sankey-label-style';
import { providePhastValidService, SankeyResultsService, SankeyScenario } from './sankey-results.service';

@Component({
  selector: 'app-process-heating-sankey',
  standalone: false,
  templateUrl: './process-heating-sankey.component.html',
  styleUrl: './process-heating-sankey.component.css',
  providers: [{ provide: PhastValidService, useFactory: providePhastValidService }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessHeatingSankeyComponent {
  private readonly sankeyResultsService = inject(SankeyResultsService);
  private readonly validityService = inject(ProcessHeatingValidityService);

  readonly settings: Signal<Settings> = this.sankeyResultsService.settings;
  readonly labelStyle = signal<SankeyLabelStyle>('both');
  readonly labelStyleOptions = SANKEY_LABEL_STYLE_OPTIONS;
  readonly selectedId = signal<string>('baseline');

  readonly scenarios: Signal<SankeyScenario[]> = computed(() =>
    this.sankeyResultsService.scenarios().filter(scenario => this.validityService.scenarioValidity(scenario.id).isValid)
  );

  /** Falls back to the first scenario when the selected one is deleted or becomes invalid. */
  readonly selectedScenario: Signal<SankeyScenario | undefined> = computed(() =>
    this.scenarios().find(scenario => scenario.id === this.selectedId()) ?? this.scenarios()[0]
  );
}
