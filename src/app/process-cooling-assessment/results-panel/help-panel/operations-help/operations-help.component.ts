import { Component, inject, WritableSignal } from '@angular/core';
import { ProcessCoolingUiService } from '../../../services/process-cooling-ui.service';

@Component({
  selector: 'app-operations-help',
  standalone: false,
  templateUrl: './operations-help.component.html',
  styleUrl: './operations-help.component.css'
})
export class OperationsHelpComponent {
  private processCoolingService = inject(ProcessCoolingUiService);
  focusedField: WritableSignal<string> = this.processCoolingService.focusedFieldSignal;
}
