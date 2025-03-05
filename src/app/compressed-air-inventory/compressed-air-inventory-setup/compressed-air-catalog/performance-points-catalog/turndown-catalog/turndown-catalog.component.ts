import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirItem, PerformancePoint } from '../../../../compressed-air-inventory';
import { CompressedAirInventoryService } from '../../../../compressed-air-inventory.service';
import { CompressedAirCatalogService } from '../../compressed-air-catalog.service';
import { PerformancePointsCatalogService, PerformancePointWarnings, ValidationMessageMap } from '../performance-points-catalog.service';
import { TurndownCatalogService } from './turndown-catalog.service';
import { Settings } from '../../../../../shared/models/settings';

@Component({
  selector: '[app-turndown-catalog]',
  templateUrl: './turndown-catalog.component.html',
  styleUrl: './turndown-catalog.component.css'
})
export class TurndownCatalogComponent implements OnInit {


  settingsSub: Subscription;
  settings: Settings;
  selectedCompressorSub: Subscription;
  form: UntypedFormGroup;
  isFormChange: boolean = false;
  validationMessages: ValidationMessageMap;
  warnings: PerformancePointWarnings;

  showPressureCalc: boolean;
  showAirflowCalc: boolean;
  showPowerCalc: boolean;
  selectedCompressor: CompressedAirItem;
  atmosphericPressure: number;
  inventoryDataSub: Subscription;

  constructor(private performancePointsCatalogService: PerformancePointsCatalogService,
    private compressedAirCatalogService: CompressedAirCatalogService,
    private compressedAirInventoryService: CompressedAirInventoryService,
    private turndownCatalogService: TurndownCatalogService) { }


  ngOnInit(): void {
    
    this.inventoryDataSub = this.compressedAirInventoryService.compressedAirInventoryData.subscribe(inventoryData => {
      if (inventoryData) {
        this.atmosphericPressure = inventoryData.systemInformation.atmosphericPressure;
      }
    });

    this.settingsSub = this.compressedAirInventoryService.settings.subscribe(val => {
      this.settings = val;
    });
    //this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.selectedCompressorSub = this.compressedAirCatalogService.selectedCompressedAirItem.subscribe(compressor => {
      if (compressor) {
        this.selectedCompressor = compressor;
        this.checkShowCalc();
        this.warnings = this.performancePointsCatalogService.checkMotorServiceFactorExceededWarning(compressor.compressedAirPerformancePointsProperties.turndown.power, compressor);
        if (this.isFormChange == false) {
          this.form = this.performancePointsCatalogService.getPerformancePointFormFromObj(compressor.compressedAirPerformancePointsProperties.turndown, compressor, 'turndown');
          this.validationMessages = this.performancePointsCatalogService.validationMessageMap.getValue();
        } else {
          this.updateForm(compressor.compressedAirPerformancePointsProperties.turndown);
          this.isFormChange = false;
        }
      }
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
    this.inventoryDataSub.unsubscribe();
  }

  save() {
    this.isFormChange = true;
    let turndown: PerformancePoint = this.performancePointsCatalogService.getPerformancePointObjFromForm(this.form);
    //TODO: CA Inventory
    //this.compressedAirDataManagementService.updateTurndown(turndown);
  }

  focusField(str: string) {
    this.compressedAirInventoryService.focusedField.next(str);
  }

  saveDischargePressure() {
    this.form.controls.isDefaultPressure.patchValue(false);
    this.save();
  }

  saveAirFlow() {
    this.form.controls.isDefaultAirFlow.patchValue(false);
    this.save();
  }

  savePower() {
    this.form.controls.isDefaultPower.patchValue(false);
    this.save();
  }

  checkShowCalc() {
    if (!this.selectedCompressor.compressedAirPerformancePointsProperties.turndown.isDefaultAirFlow) {
      let defaultValue: number = this.turndownCatalogService.getTurndownAirflow(this.selectedCompressor, true, this.settings);
      this.showAirflowCalc = (this.selectedCompressor.compressedAirPerformancePointsProperties.turndown.airflow != defaultValue);
    } else {
      this.showAirflowCalc = false;
    }

    if (!this.selectedCompressor.compressedAirPerformancePointsProperties.turndown.isDefaultPower) {
      let defaultValue: number = this.turndownCatalogService.getTurndownPower(this.selectedCompressor, true);
      this.showPowerCalc = (this.selectedCompressor.compressedAirPerformancePointsProperties.turndown.power != defaultValue);
    } else {
      this.showPowerCalc = false;
    }

    if (!this.selectedCompressor.compressedAirPerformancePointsProperties.turndown.isDefaultPressure) {
      let defaultValue: number = this.turndownCatalogService.getTurndownPressure(this.selectedCompressor, true, this.settings);
      this.showPressureCalc = (this.selectedCompressor.compressedAirPerformancePointsProperties.turndown.dischargePressure != defaultValue);
    } else {
      this.showPressureCalc = false;
    }
  }

  setAirFlow() {
    let defaultValue: number = this.turndownCatalogService.getTurndownAirflow(this.selectedCompressor, true, this.settings);
    this.form.controls.airflow.patchValue(defaultValue);
    this.form.controls.isDefaultAirFlow.patchValue(true);
    this.save();
  }

  setPower() {
    let defaultValue: number = this.turndownCatalogService.getTurndownPower(this.selectedCompressor, true);
    this.form.controls.power.patchValue(defaultValue);
    this.form.controls.isDefaultPower.patchValue(true);
    this.save();
  }

  setPressure() {
    let defaultValue: number = this.turndownCatalogService.getTurndownPressure(this.selectedCompressor, true, this.settings);
    this.form.controls.dischargePressure.patchValue(defaultValue);
    this.form.controls.isDefaultPressure.patchValue(true);
    this.save();
  }
  updateForm(performancePoint: PerformancePoint) {
    if (performancePoint.airflow != this.form.controls.airflow.value) {
      this.form.controls.airflow.patchValue(performancePoint.airflow);
    }
    if (performancePoint.dischargePressure != this.form.controls.dischargePressure.value) {
      this.form.controls.dischargePressure.patchValue(performancePoint.dischargePressure);
    }
    if (performancePoint.power != this.form.controls.power.value) {
      this.form.controls.power.patchValue(performancePoint.power);
    }
  }


}
