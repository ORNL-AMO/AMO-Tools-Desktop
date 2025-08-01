import { Component, WritableSignal } from '@angular/core';
import { ProcessCoolingUiService } from '../../../services/process-cooling-ui.service';

@Component({
  selector: 'app-inventory-help',
  standalone: false,
  templateUrl: './inventory-help.component.html',
  styleUrl: './inventory-help.component.css'
})
export class InventoryHelpComponent {
  focusedField: WritableSignal<string>;
  constructor(private processCoolingService: ProcessCoolingUiService) { 
    this.focusedField = this.processCoolingService.focusedFieldSignal;
  }

}
