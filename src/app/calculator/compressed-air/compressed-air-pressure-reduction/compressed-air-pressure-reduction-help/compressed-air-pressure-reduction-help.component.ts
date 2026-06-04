import { Component, Signal, inject, input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { environment } from '../../../../../environments/environment';
import { CompressedAirPressureReductionService } from '../compressed-air-pressure-reduction.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-compressed-air-pressure-reduction-help',
  templateUrl: './compressed-air-pressure-reduction-help.component.html',
  styleUrls: ['./compressed-air-pressure-reduction-help.component.css'],
  standalone: false
})
export class CompressedAirPressureReductionHelpComponent {
  settings = input.required<Settings>();

  private compressedAirPressureReductionService: CompressedAirPressureReductionService = inject(CompressedAirPressureReductionService);
  currentField: Signal<string> = toSignal(this.compressedAirPressureReductionService.focusedField);

  docsLink: string = environment.measurDocsUrl;

}
