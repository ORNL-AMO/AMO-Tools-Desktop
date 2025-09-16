import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OtherOptions, MotorItem } from '../../../motor-inventory';
import { MotorCatalogService } from '../motor-catalog.service';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { OtherDataService } from './other-data.service';
import { driveConstants } from '../../../../psat/psatConstants';

@Component({
    selector: 'app-other-data',
    templateUrl: './other-data.component.html',
    styleUrls: ['./other-data.component.css'],
    standalone: false
})
export class OtherDataComponent implements OnInit {

  motorForm: UntypedFormGroup;
  selectedMotorItemSub: Subscription;
  displayOptions: OtherOptions;
  displayForm: boolean = true;
  driveTypes: Array<{ value: number, display: string }>;
  constructor(private motorCatalogService: MotorCatalogService, private motorInventoryService: MotorInventoryService,
    private otherDataService: OtherDataService) { }

  ngOnInit(): void {
    this.driveTypes = JSON.parse(JSON.stringify(driveConstants));
    //remove specified
    this.driveTypes.pop();

    this.selectedMotorItemSub = this.motorCatalogService.selectedMotorItem.subscribe(selectedMotor => {
      if (selectedMotor) {
        this.motorForm = this.otherDataService.getFormFromOtherData(selectedMotor.otherData);
      }
    });
    this.displayOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.otherOptions;
  }

  ngOnDestroy() {
    this.selectedMotorItemSub.unsubscribe();
  }

  save() {
    let selectedMotor: MotorItem = this.motorCatalogService.selectedMotorItem.getValue();
    selectedMotor.otherData = this.otherDataService.updateOtherDataFromForm(this.motorForm, selectedMotor.otherData);
    this.motorInventoryService.updateMotorItem(selectedMotor);
  }

  focusField(str: string) {
    this.motorInventoryService.focusedDataGroup.next('other');
    this.motorInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
    // this.focusOut();
  }

  // focusOut() {
  //   this.motorInventoryService.focusedDataGroup.next('other')
  //   this.motorInventoryService.focusedField.next('default');
  // }
}
