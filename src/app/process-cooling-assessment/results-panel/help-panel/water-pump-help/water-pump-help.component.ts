import { Component, inject, WritableSignal } from '@angular/core';
import { ProcessCoolingUiService } from '../../../services/process-cooling-ui.service';

@Component({
  selector: 'app-water-pump-help',
  standalone: false,
  templateUrl: './water-pump-help.component.html',
  styleUrl: './water-pump-help.component.css'
})
export class WaterPumpHelpComponent {
  private processCoolingService = inject(ProcessCoolingUiService);
  focusedField: WritableSignal<string> = this.processCoolingService.focusedFieldSignal;

}
