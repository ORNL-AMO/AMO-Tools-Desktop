import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { PumpItem, PumpMotorPropertiesOptions } from '../../../pump-inventory';
import { PumpInventoryService } from '../../../pump-inventory.service';
import { PumpCatalogService } from '../pump-catalog.service';
import { PumpMotorCatalogService } from './pump-motor-catalog.service';
import { motorEfficiencyConstants } from '../../../../psat/psatConstants';

@Component({
  selector: 'app-pump-motor-catalog',
  templateUrl: './pump-motor-catalog.component.html',
  styleUrls: ['./pump-motor-catalog.component.css']
})
export class PumpMotorCatalogComponent implements OnInit {

  settingsSub: Subscription;
  settings: Settings;
  
  form: FormGroup;
  selectedPumpItemSub: Subscription;
  displayOptions: PumpMotorPropertiesOptions;
  displayForm: boolean = true;

  statusTypes: Array<{value: number, display: string}>;
  priorityTypes: Array<{value: number, display: string}>;
  lineFrequencies: Array<{value: number, display: string}> = [
    {value: 50, display: '50Hz'},
    {value: 60, display: '60Hz'},
  ];
  motorEfficiencyClasses: Array<{ value: number, display: string }>;
  constructor(private pumpCatalogService: PumpCatalogService, private pumpInventoryService: PumpInventoryService,
    private pumpMotorCatalogService: PumpMotorCatalogService) { }

  ngOnInit(): void {
    this.motorEfficiencyClasses = motorEfficiencyConstants;
    this.settingsSub = this.pumpInventoryService.settings.subscribe(val => {
      this.settings = val;
    });
    this.selectedPumpItemSub = this.pumpCatalogService.selectedPumpItem.subscribe(selectedPump => {
      if (selectedPump) {
        this.form = this.pumpMotorCatalogService.getFormFromPumpMotor(selectedPump.pumpMotor);
      }
    });
    this.displayOptions = this.pumpInventoryService.pumpInventoryData.getValue().displayOptions.pumpMotorPropertiesOptions;
  }

  ngOnDestroy() {
    this.selectedPumpItemSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  save() {
    let selectedPump: PumpItem = this.pumpCatalogService.selectedPumpItem.getValue();
    selectedPump.pumpMotor = this.pumpMotorCatalogService.updatePumpMotorFromForm(this.form, selectedPump.pumpMotor);
    this.pumpInventoryService.updatePumpItem(selectedPump);
  }

  focusField(str: string) {
    this.pumpInventoryService.focusedDataGroup.next('pump-motor');
    this.pumpInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

}
