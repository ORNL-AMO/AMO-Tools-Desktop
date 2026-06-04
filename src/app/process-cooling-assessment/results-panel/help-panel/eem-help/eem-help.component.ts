import { Component, inject, WritableSignal } from '@angular/core';
import { ProcessCoolingUiService } from '../../../services/process-cooling-ui.service';

@Component({
  selector: 'app-eem-help',
  templateUrl: './eem-help.component.html',
  standalone: false,
  styleUrls: ['./eem-help.component.css']
})
export class EemHelpComponent {
    private processCoolingService = inject(ProcessCoolingUiService);
    focusedField: WritableSignal<string> = this.processCoolingService.focusedFieldSignal;
}
