import { Component, OnInit, Input } from '@angular/core';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { MotorPropertyDisplayOptions, MotorItem } from '../../../motor-inventory';
import { driveConstants } from '../../../../psat/psatConstants';
import { MotorCatalogService } from '../motor-catalog.service';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { Settings } from 'http2';

@Component({
  selector: 'app-optional-properties',
  templateUrl: './optional-properties.component.html',
  styleUrls: ['./optional-properties.component.css']
})
export class OptionalPropertiesComponent implements OnInit {
  @Input()
  settings: Settings

  displayOptions: MotorPropertyDisplayOptions;
  driveTypes: Array<{ value: number, display: string }>;
  selectedMotorItemSub: Subscription;
  motorForm: FormGroup;
  constructor(private motorInventoryService: MotorInventoryService, private motorCatalogService: MotorCatalogService) { }

  ngOnInit(): void {
    this.driveTypes = driveConstants;
    this.displayOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions;
    this.selectedMotorItemSub = this.motorCatalogService.selectedMotorItem.subscribe(selectedMotor => {
      if (selectedMotor) {
        this.motorForm = this.motorCatalogService.getOptionalFormFromMotorItem(selectedMotor);
      }
    });
  }

  ngOnDestroy(){
    this.selectedMotorItemSub.unsubscribe();
  }

  save() {
    let selectedMotor: MotorItem = this.motorCatalogService.selectedMotorItem.getValue();
    selectedMotor = this.motorCatalogService.updateMotorItemFromOptionalForm(this.motorForm, selectedMotor);
    this.motorInventoryService.updateMotorItem(selectedMotor);
  }

  focusField(str: string) {
    this.motorInventoryService.focusedField.next(str);
  }

}
