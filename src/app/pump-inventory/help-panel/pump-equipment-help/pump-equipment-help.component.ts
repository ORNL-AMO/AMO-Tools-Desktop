import { Component } from '@angular/core';
import { PumpInventoryService } from '../../pump-inventory.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-pump-equipment-help',
  templateUrl: './pump-equipment-help.component.html',
  styleUrls: ['./pump-equipment-help.component.css']
})
export class PumpEquipmentHelpComponent {

  focusedField: string;
  focusedFieldSub: Subscription;
  settings: Settings;
  constructor(private pumpInventoryService: PumpInventoryService) { }

  ngOnInit(): void {
    this.settings = this.pumpInventoryService.settings.getValue();
    this.focusedFieldSub = this.pumpInventoryService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
  }

  ngOnDestroy(){
    this.focusedFieldSub.unsubscribe();
  }

}
