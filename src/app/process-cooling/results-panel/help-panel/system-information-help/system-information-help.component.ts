import { Component, WritableSignal } from '@angular/core';
import { ProcessCoolingUiService } from '../../../process-cooling-ui.service';

@Component({
  selector: 'app-system-information-help',
  standalone: false,
  templateUrl: './system-information-help.component.html',
  styleUrl: './system-information-help.component.css'
})
export class SystemInformationHelpComponent {
  focusedField: WritableSignal<string>;
  constructor(private processCoolingService: ProcessCoolingUiService) { 
    this.focusedField = this.processCoolingService.focusedFieldSignal;
  }


}
