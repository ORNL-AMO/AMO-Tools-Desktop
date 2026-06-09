import { Component, Signal, inject, input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { environment } from '../../../../../environments/environment';
import { CompressedAirReductionService } from '../compressed-air-reduction.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-compressed-air-reduction-help',
  templateUrl: './compressed-air-reduction-help.component.html',
  styleUrls: ['./compressed-air-reduction-help.component.css'],
  standalone: false
})
export class CompressedAirReductionHelpComponent {
  settings = input.required<Settings>();

  private compressedAirReductionService: CompressedAirReductionService = inject(CompressedAirReductionService);
  // currentField is driven by the form's focusField/focusOut calls via the service
  currentField: Signal<string> = toSignal(this.compressedAirReductionService.focusedField);

  docsLink: string = environment.measurDocsUrl;
}
