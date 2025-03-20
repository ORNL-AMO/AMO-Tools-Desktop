import { Component, OnInit } from '@angular/core';
import { MotorCatalogService } from '../motor-catalog.service';
import { Subscription } from 'rxjs';
import { UntypedFormGroup } from '@angular/forms';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { MotorItem } from '../../../motor-inventory';
import { MotorBasicsService } from './motor-basics.service';

@Component({
    selector: 'app-motor-basics',
    templateUrl: './motor-basics.component.html',
    styleUrls: ['./motor-basics.component.css'],
    standalone: false
})
export class MotorBasicsComponent implements OnInit {

  motorForm: UntypedFormGroup;
  selectedMotorItemSub: Subscription;
  constructor(private motorCatalogService: MotorCatalogService, private motorInventoryService: MotorInventoryService,
    private motorBasicsService: MotorBasicsService) { }

  ngOnInit(): void {
    this.selectedMotorItemSub = this.motorCatalogService.selectedMotorItem.subscribe(selectedMotor => {
      if (selectedMotor) {
        this.motorForm = this.motorBasicsService.getFormFromMotorItem(selectedMotor);
      }
    });
  }

  ngOnDestroy() {
    this.selectedMotorItemSub.unsubscribe();
  }

  save() {
    let selectedMotor: MotorItem = this.motorCatalogService.selectedMotorItem.getValue();
    selectedMotor = this.motorBasicsService.updateMotorItemFromForm(this.motorForm, selectedMotor);
    this.motorInventoryService.updateMotorItem(selectedMotor);
  }

  focusField(str: string) {
    this.motorInventoryService.focusedDataGroup.next('basics');
    this.motorInventoryService.focusedField.next(str);
  }
}
