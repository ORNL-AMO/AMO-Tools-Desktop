import { Component, OnInit } from '@angular/core';
import { MotorCatalogService } from '../motor-catalog.service';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { MotorInventoryData, MotorItem } from '../../../motor-inventory';

@Component({
  selector: 'app-motor-basics',
  templateUrl: './motor-basics.component.html',
  styleUrls: ['./motor-basics.component.css']
})
export class MotorBasicsComponent implements OnInit {

  selectedMotorItemSub: Subscription;
  motorForm: FormGroup;
  constructor(private motorCatalogService: MotorCatalogService, private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.selectedMotorItemSub = this.motorCatalogService.selectedMotorItem.subscribe(selectedMotor => {
      if (selectedMotor) {
        //this.motorForm = this.motorCatalogService.getMotorBasicsForm(selectedMotor);
      }
    });
  }

  ngOnDestroy() {
    this.selectedMotorItemSub.unsubscribe();
  }

  save() {
    let selectedMotor: MotorItem = this.motorCatalogService.selectedMotorItem.getValue();
   // selectedMotor = this.motorCatalogService.updateMotorItemFromBasicsForm(this.motorForm, selectedMotor);
    this.motorInventoryService.updateMotorItem(selectedMotor);
  }

  focusField(str: string) {
    this.motorInventoryService.focusedField.next(str);
  }

  openOperatingHoursModal() {

  }
}
