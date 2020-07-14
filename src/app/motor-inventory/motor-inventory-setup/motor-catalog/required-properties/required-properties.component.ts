import { Component, OnInit, Input } from '@angular/core';
import { motorEfficiencyConstants } from '../../../../psat/psatConstants';
import { FormGroup } from '@angular/forms';
import { MotorCatalogService } from '../motor-catalog.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { MotorInventoryService } from '../../../motor-inventory.service';

@Component({
  selector: 'app-required-properties',
  templateUrl: './required-properties.component.html',
  styleUrls: ['./required-properties.component.css']
})
export class RequiredPropertiesComponent implements OnInit {
  @Input()
  settings: Settings;


  frequencies: Array<number> = [50, 60];
  efficiencyClasses: Array<{ value: number, display: string }>;
  motorForm: FormGroup;
  selectedMotorItemSub: Subscription
  constructor(private motorCatalogService: MotorCatalogService, private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.efficiencyClasses = motorEfficiencyConstants;
    this.selectedMotorItemSub = this.motorCatalogService.selectedMotorItem.subscribe(selectedMotor => {
      if (selectedMotor) {
        this.motorForm = this.motorCatalogService.getRequiredFormFromMotorItem(selectedMotor);
      }
    });
  }

  ngOnDestroy(){
    this.selectedMotorItemSub.unsubscribe();
  }

  save(){

  }

  //TODO: Update nominalEfficiency?
  changeEfficiencyClass() {

    this.save();
  }

  focusField(str: string) {
    this.motorInventoryService.focusedField.next(str);
  }

}
