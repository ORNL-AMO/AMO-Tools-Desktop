import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProcessCoolingService } from '../../../process-cooling.service';

@Component({
  selector: 'app-inventory-help',
  standalone: false,
  templateUrl: './inventory-help.component.html',
  styleUrl: './inventory-help.component.css'
})
export class InventoryHelpComponent {
  focusedField: string;
  focusedFieldSub: Subscription;
  constructor(private processCoolingService: ProcessCoolingService) { }

  ngOnInit(): void {
    this.focusedFieldSub = this.processCoolingService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
  }

  ngOnDestroy(){
    this.focusedFieldSub.unsubscribe();
  }

}
