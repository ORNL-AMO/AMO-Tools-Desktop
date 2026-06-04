import { Component, viewChild, ElementRef, input, inject, Signal, computed, signal, afterRenderEffect } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirPressureReductionData, CompressedAirPressureReductionResults } from '../../../../shared/models/standalone';
import { CompressedAirPressureReductionService } from '../compressed-air-pressure-reduction.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-compressed-air-pressure-reduction-results',
  templateUrl: './compressed-air-pressure-reduction-results.component.html',
  styleUrls: ['./compressed-air-pressure-reduction-results.component.css'],
  standalone: false
})
export class CompressedAirPressureReductionResultsComponent {
  settings = input.required<Settings>();

  private compressedAirPressureReductionService: CompressedAirPressureReductionService = inject(CompressedAirPressureReductionService);

  copyTable = viewChild<ElementRef>('copyTable');
  tableString = signal<string>('');

  modificationData: Signal<Array<CompressedAirPressureReductionData>> = toSignal(this.compressedAirPressureReductionService.modificationData);

  modificationExists: Signal<boolean> = computed(() => {
    return this.modificationData().length > 0;
  });

  results: Signal<CompressedAirPressureReductionResults> = toSignal(this.compressedAirPressureReductionService.results);

  constructor() {
    afterRenderEffect(() => {
      const el = this.copyTable();
      if (el) {
        this.tableString.set(el.nativeElement.innerText);
      }
    });
  }
}