import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NameplateDataOptions, MotorItem } from '../../../motor-inventory';
import { MotorCatalogService } from '../motor-catalog.service';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { NameplateDataService } from './nameplate-data.service';
import { Settings } from '../../../../shared/models/settings';
import { motorEfficiencyConstants } from '../../../../psat/psatConstants';
import { PsatService } from '../../../../psat/psat.service';

@Component({
  selector: 'app-nameplate-data',
  templateUrl: './nameplate-data.component.html',
  styleUrls: ['./nameplate-data.component.css']
})
export class NameplateDataComponent implements OnInit {
  settingsSub: Subscription;
  settings: Settings;

  motorForm: UntypedFormGroup;
  selectedMotorItemSub: Subscription;
  displayOptions: NameplateDataOptions;
  displayForm: boolean = true;
  frequencies: Array<number> = [50, 60];
  efficiencyClasses: Array<{ value: number, display: string }>;
  voltageRatingOptions: Array<number> = [200, 208, 220, 230, 440, 460, 575, 796, 2300, 4000, 6600];
  constructor(private motorCatalogService: MotorCatalogService, private motorInventoryService: MotorInventoryService,
    private nameplateDataService: NameplateDataService, private psatService: PsatService) { }

  ngOnInit(): void {
    //TODO: add warnings for FLA

    this.settingsSub = this.motorInventoryService.settings.subscribe(val => {
      this.settings = val;
    });
    this.efficiencyClasses = JSON.parse(JSON.stringify(motorEfficiencyConstants));
    this.efficiencyClasses.pop();
    this.selectedMotorItemSub = this.motorCatalogService.selectedMotorItem.subscribe(selectedMotor => {
      if (selectedMotor) {
        this.motorForm = this.nameplateDataService.getFormFromNameplateData(selectedMotor.nameplateData);
      }
    });
    this.displayOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.nameplateDataOptions;
  }

  ngOnDestroy() {
    this.selectedMotorItemSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  save() {
    let selectedMotor: MotorItem = this.motorCatalogService.selectedMotorItem.getValue();
    selectedMotor.nameplateData = this.nameplateDataService.updateNameplateDataFromForm(this.motorForm, selectedMotor.nameplateData);
    this.motorInventoryService.updateMotorItem(selectedMotor);
  }

  focusField(str: string) {
    this.motorInventoryService.focusedDataGroup.next('nameplate-data');
    this.motorInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
    // this.focusOut();
  }

  // focusOut() {
  //   this.motorInventoryService.focusedDataGroup.next('nameplate-data')
  //   this.motorInventoryService.focusedField.next('default');
  // }

  estimateEfficiency() {
    if (this.displayOptions.fullLoadSpeed) {
      let efficiency: number = this.motorCatalogService.estimateEfficiency(100, false);
      this.motorForm.controls.nominalEfficiency.patchValue(efficiency);
      this.save();
    }
  }

  calculateFullLoadAmps() {
    if (this.displayOptions.fullLoadSpeed && this.displayOptions.ratedVoltage) {
      let motorPower: number = this.motorForm.controls.ratedMotorPower.value;
      let motorRPM: number = this.motorForm.controls.fullLoadSpeed.value;
      let lineFrequency: number = this.motorForm.controls.lineFrequency.value;
      //use specified and nominal efficiency
      let efficiencyClass: number = 3;
      let efficiency: number = this.motorForm.controls.nominalEfficiency.value;
      let motorVoltage: number = this.motorForm.controls.ratedVoltage.value;
      let fla: number = this.psatService.estFLA(motorPower, motorRPM, lineFrequency, efficiencyClass, efficiency, motorVoltage, this.settings);
      this.motorForm.controls.fullLoadAmps.patchValue(fla);
      this.save();
    }
  }
  focusHelp(str: string) {
    this.focusField(str);
    this.motorInventoryService.helpPanelTab.next('help');
  }
}
