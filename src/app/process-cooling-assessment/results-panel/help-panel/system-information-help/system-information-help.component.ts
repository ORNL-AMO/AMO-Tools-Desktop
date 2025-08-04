import { Component, inject, Signal, WritableSignal } from '@angular/core';
import { ProcessCoolingUiService } from '../../../services/process-cooling-ui.service';
import { ROUTE_TOKENS } from '../../../process-cooling-assessment.module';

@Component({
  selector: 'app-system-information-help',
  standalone: false,
  templateUrl: './system-information-help.component.html',
  styleUrl: './system-information-help.component.css'
})
export class SystemInformationHelpComponent {
  private readonly processCoolingUiService = inject(ProcessCoolingUiService);
  readonly ROUTE_TOKENS = ROUTE_TOKENS;
  focusedField: WritableSignal<string> = this.processCoolingUiService.focusedFieldSignal;
  setupSubView: Signal<string> = this.processCoolingUiService.setupSubView;

}
