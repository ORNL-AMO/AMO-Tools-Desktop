import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { PumpInventoryService } from '../../pump-inventory.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-pump-field-help',
  templateUrl: './pump-field-help.component.html',
  styleUrls: ['./pump-field-help.component.css']
})
export class PumpFieldHelpComponent {

  focusedField: string;
  focusedFieldSub: Subscription;
  settings: Settings;
  constructor(private pumpInventoryService: PumpInventoryService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit(): void {
    this.settings = this.pumpInventoryService.settings.getValue();
    this.focusedFieldSub = this.pumpInventoryService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
  }

  getDisplayUnit(unit: any) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }

  ngOnDestroy(){
    this.focusedFieldSub.unsubscribe();
  }

}
