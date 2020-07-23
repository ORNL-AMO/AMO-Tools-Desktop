import { Component, OnInit } from '@angular/core';
import { MotorItem, TorqueOptions } from '../../../motor-inventory';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MotorCatalogService } from '../motor-catalog.service';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { TorqueDataService } from './torque-data.service';

@Component({
  selector: 'app-torque-data',
  templateUrl: './torque-data.component.html',
  styleUrls: ['./torque-data.component.css']
})
export class TorqueDataComponent implements OnInit {
  motorForm: FormGroup;
  selectedMotorItemSub: Subscription;
  displayOptions: TorqueOptions;
  displayForm: boolean = true;
  constructor(private motorCatalogService: MotorCatalogService, private motorInventoryService: MotorInventoryService,
    private torqueDataService: TorqueDataService) { }

  ngOnInit(): void {
    this.selectedMotorItemSub = this.motorCatalogService.selectedMotorItem.subscribe(selectedMotor => {
      if (selectedMotor) {
        this.motorForm = this.torqueDataService.getFormFromTorqueData(selectedMotor.torqueData);
      }
    });
    this.displayOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.torqueOptions;
  }

  ngOnDestroy() {
    this.selectedMotorItemSub.unsubscribe();
  }

  save() {
    let selectedMotor: MotorItem = this.motorCatalogService.selectedMotorItem.getValue();
    selectedMotor.torqueData = this.torqueDataService.updateTorqueDataFromForm(this.motorForm, selectedMotor.torqueData);
    this.motorInventoryService.updateMotorItem(selectedMotor);
  }

  focusField(str: string) {
    this.motorInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }
}
