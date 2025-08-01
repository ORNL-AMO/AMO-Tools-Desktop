import { Component, WritableSignal } from '@angular/core';
import { ProcessCoolingUiService } from '../../../services/process-cooling-ui.service';

@Component({
  selector: 'app-system-basics-help',
  standalone: false,
  templateUrl: './system-basics-help.component.html',
  styleUrl: './system-basics-help.component.css'
})
export class SystemBasicsHelpComponent {
  focusedField: WritableSignal<string>;
  constructor(private processCoolingService: ProcessCoolingUiService) { 
    this.focusedField = this.processCoolingService.focusedFieldSignal;
  }
}
