import { Component, inject, WritableSignal } from '@angular/core';
import { ProcessCoolingUiService } from '../../../services/process-cooling-ui.service';

@Component({
  selector: 'app-system-basics-help',
  standalone: false,
  templateUrl: './system-basics-help.component.html',
  styleUrl: './system-basics-help.component.css'
})
export class SystemBasicsHelpComponent {
  private processCoolingService = inject(ProcessCoolingUiService);
  focusedField: WritableSignal<string> = this.processCoolingService.focusedFieldSignal;

}
