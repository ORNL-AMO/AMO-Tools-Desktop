import { Component, OnInit } from '@angular/core';
import { Settings } from '../../../../../shared/models/settings';
import { CompressedAirItem, PerformancePoint } from '../../../../compressed-air-inventory';
import { Subscription } from 'rxjs';
import { UntypedFormGroup } from '@angular/forms';
import { PerformancePointsCatalogService, PerformancePointWarnings, ValidationMessageMap } from '../performance-points-catalog.service';
import { CompressedAirCatalogService } from '../../compressed-air-catalog.service';
import { CompressedAirInventoryService } from '../../../../compressed-air-inventory.service';
import { FullLoadCatalogService } from './full-load-catalog.service';
import { CompressorDataManagementService } from '../../../../compressor-data-management.service';

@Component({
  selector: '[app-full-load-catalog]',
  templateUrl: './full-load-catalog.component.html',
  styleUrl: './full-load-catalog.component.css',
  standalone: false
})
export class FullLoadCatalogComponent implements OnInit {


  settingsSub: Subscription;
  settings: Settings;
  selectedCompressorSub: Subscription;
  form: UntypedFormGroup;
  isFormChange: boolean = false;
  fullLoadLabel: string;
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
    private fullLoadCatalogService: FullLoadCatalogService,
    private compressedAirDataManagementService: CompressorDataManagementService) { }



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
        this.warnings = this.performancePointsCatalogService.checkMotorServiceFactorExceededWarning(compressor.compressedAirPerformancePointsProperties.fullLoad.power, compressor);
        if (this.isFormChange == false) {
          this.setFullLoadLabel(compressor.compressedAirControlsProperties.controlType);
          this.form = this.performancePointsCatalogService.getPerformancePointFormFromObj(compressor.compressedAirPerformancePointsProperties.fullLoad, compressor, 'fullLoad')
          this.validationMessages = this.performancePointsCatalogService.validationMessageMap.getValue();
        } else {
          this.updateForm(compressor.compressedAirPerformancePointsProperties.fullLoad);
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
    let fullLoad: PerformancePoint = this.performancePointsCatalogService.getPerformancePointObjFromForm(this.form);
    this.compressedAirDataManagementService.updateFullLoad(fullLoad);
  }

  focusField(str: string) {
    this.compressedAirInventoryService.focusedField.next(str);
  }

  setFullLoadLabel(controlType: number) {
    if (controlType == 1 || controlType == 7 || controlType == 9) {
      this.fullLoadLabel = "";
    } else {
      this.fullLoadLabel = "(cut-in)";
    }
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
    if (!this.selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.isDefaultAirFlow) {
      let defaultValue: number = this.fullLoadCatalogService.getFullLoadAirFlow(this.selectedCompressor, true, this.atmosphericPressure, this.settings);
      this.showAirflowCalc = (this.selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.airflow != defaultValue);
    } else {
      this.showAirflowCalc = false;
    }

    if (!this.selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.isDefaultPower) {
      let defaultValue: number = this.fullLoadCatalogService.getFullLoadPower(this.selectedCompressor, true, this.atmosphericPressure, this.settings);
      this.showPowerCalc = (this.selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.power != defaultValue);
    } else {
      this.showPowerCalc = false;
    }

    if (!this.selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.isDefaultPressure) {
      let defaultValue: number = this.fullLoadCatalogService.getFullLoadDischargePressure(this.selectedCompressor, true, this.settings);
      this.showPressureCalc = (this.selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.dischargePressure != defaultValue);
    } else {
      this.showPressureCalc = false;
    }
  }

  setAirFlow() {
    let defaultValue: number = this.fullLoadCatalogService.getFullLoadAirFlow(this.selectedCompressor, true, this.atmosphericPressure, this.settings);
    this.form.controls.airflow.patchValue(defaultValue);
    this.form.controls.isDefaultAirFlow.patchValue(true);
    this.save();
  }

  setPower() {
    let defaultValue: number = this.fullLoadCatalogService.getFullLoadPower(this.selectedCompressor, true, this.atmosphericPressure, this.settings);
    this.form.controls.power.patchValue(defaultValue);
    this.form.controls.isDefaultPower.patchValue(true);
    this.save();
  }

  setPressure() {
    let defaultValue: number = this.fullLoadCatalogService.getFullLoadDischargePressure(this.selectedCompressor, true, this.settings);
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
