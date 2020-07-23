import { Component, OnInit, Input } from '@angular/core';
import { Settings } from 'http2';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MotorCatalogService } from '../motor-catalog.service';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { motorEfficiencyConstants } from '../../../../psat/psatConstants';
import { MotorItem } from '../../../motor-inventory';
import { RequiredMotorDataService } from './required-motor-data.service';

@Component({
  selector: 'app-required-motor-data',
  templateUrl: './required-motor-data.component.html',
  styleUrls: ['./required-motor-data.component.css']
})
export class RequiredMotorDataComponent implements OnInit {
  @Input()
  settings: Settings;


  frequencies: Array<number> = [50, 60];
  efficiencyClasses: Array<{ value: number, display: string }>;
  motorForm: FormGroup;
  selectedMotorItemSub: Subscription;
  displayForm: boolean = true;
  constructor(private motorCatalogService: MotorCatalogService, private motorInventoryService: MotorInventoryService,
    private requiredMotorDataService: RequiredMotorDataService) { }

  ngOnInit(): void {
    this.efficiencyClasses = motorEfficiencyConstants;
    this.selectedMotorItemSub = this.motorCatalogService.selectedMotorItem.subscribe(selectedMotor => {
      if (selectedMotor) {
        this.motorForm = this.requiredMotorDataService.getFormFromRequiredMotorData(selectedMotor.requiredMotorData);
      }
    });
  }

  ngOnDestroy(){
    this.selectedMotorItemSub.unsubscribe();
  }

  save() {
    let selectedMotor: MotorItem = this.motorCatalogService.selectedMotorItem.getValue();
    selectedMotor.requiredMotorData = this.requiredMotorDataService.updateRequiredMotorDataFromForm(this.motorForm, selectedMotor.requiredMotorData);
    this.motorInventoryService.updateMotorItem(selectedMotor);
  }

  //TODO: Update nominalEfficiency?
  changeEfficiencyClass() {

    this.save();
  }

  focusField(str: string) {
    this.motorInventoryService.focusedField.next(str);
  }

  toggleForm(){
    this.displayForm = !this.displayForm;
  }
}
