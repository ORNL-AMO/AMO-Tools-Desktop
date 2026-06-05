import { Component, viewChild, ElementRef, input, inject, Signal, computed, signal, afterRenderEffect } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirReductionData, CompressedAirReductionResults } from '../../../../shared/models/standalone';
import { CompressedAirReductionService } from '../compressed-air-reduction.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-compressed-air-reduction-results',
  templateUrl: './compressed-air-reduction-results.component.html',
  styleUrls: ['./compressed-air-reduction-results.component.css'],
  standalone: false
})
export class CompressedAirReductionResultsComponent {
  settings = input.required<Settings>();

  private compressedAirReductionService: CompressedAirReductionService = inject(CompressedAirReductionService);

  // Single savings table ref — individual baseline/modification tables are hidden per issue 7419
  copyTable = viewChild<ElementRef>('copyTable');
  tableString = signal<string>('');

  results: Signal<CompressedAirReductionResults> = toSignal(this.compressedAirReductionService.results);
  modificationData: Signal<Array<CompressedAirReductionData>> = toSignal(this.compressedAirReductionService.modificationData);
  modificationExists: Signal<boolean> = computed(() => (this.modificationData()?.length ?? 0) > 0);

  // Utility type comes from the first baseline item; drives label text (energy cost vs compressed air cost)
  utilityType: Signal<number> = computed(() => {
    const baseline = this.compressedAirReductionService.baselineData.getValue();
    return baseline?.length > 0 ? baseline[0].utilityType : 1;
  });

  constructor() {
    // Refresh the copy-table string after every render so the export button always has current content
    afterRenderEffect(() => {
      const el = this.copyTable();
      if (el) {
        this.tableString.set(el.nativeElement.innerText);
      }
    });
  }
}
