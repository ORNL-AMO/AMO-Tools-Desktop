import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirItem, PerformancePoint } from '../../../../compressed-air-inventory';
import { Settings } from '../../../../../shared/models/settings';
import { CompressedAirInventoryService } from '../../../../compressed-air-inventory.service';
import { CompressedAirCatalogService } from '../../compressed-air-catalog.service';
import { PerformancePointsCatalogService } from '../performance-points-catalog.service';
import { UnloadPointCatalogService } from './unload-point-catalog.service';

@Component({
  selector: '[app-unload-point-catalog]',
  templateUrl: './unload-point-catalog.component.html',
  styleUrl: './unload-point-catalog.component.css'
})
export class UnloadPointCatalogComponent implements OnInit {

  settingsSub: Subscription;
  settings: Settings;
  selectedCompressorSub: Subscription;
  form: UntypedFormGroup;
  isFormChange: boolean = false;
  fullLoadLabel: string;
  //validationMessages: ValidationMessageMap;
  //warnings: PerformancePointWarnings;

  showPressureCalc: boolean;
  showAirflowCalc: boolean;
  showPowerCalc: boolean;
  selectedCompressor: CompressedAirItem;
  atmosphericPressure: number;

  constructor(private performancePointsCatalogService: PerformancePointsCatalogService,
    private compressedAirCatalogService: CompressedAirCatalogService,
    private compressedAirInventoryService: CompressedAirInventoryService,
    private unloadPointCatalogService: UnloadPointCatalogService) { }


  ngOnInit(): void {
    //let compressedAirAssessment: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    //TODO: CA Inventory get atmosphericPressure
    this.atmosphericPressure = 14.7;


    this.settingsSub = this.compressedAirInventoryService.settings.subscribe(val => {
      this.settings = val;
    });
    //this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.selectedCompressorSub = this.compressedAirCatalogService.selectedCompressedAirItem.subscribe(compressor => {
      if (compressor) {
        this.selectedCompressor = compressor;
        this.checkShowCalc();
        //this.warnings = this.performancePointsFormService.checkMotorServiceFactorExceededWarning(compressor.performancePoints.fullLoad.power, compressor);
        if (this.isFormChange == false) {
          this.form = this.performancePointsCatalogService.getPerformancePointFormFromObj(compressor.compressedAirPerformancePointsProperties.fullLoad, compressor, 'unloadPoint')
          //this.validationMessages = this.performancePointsFormService.validationMessageMap.getValue();
        } else {
          this.updateForm(compressor.compressedAirPerformancePointsProperties.fullLoad);
          this.isFormChange = false;
        }
      }
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
  }

  save() {
    this.isFormChange = true;
    let fullLoad: PerformancePoint = this.performancePointsCatalogService.getPerformancePointObjFromForm(this.form);
    //TODO: CA Inventory
    //this.compressedAirDataManagementService.updateFullLoad(fullLoad);
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
    if (!this.selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.isDefaultAirFlow) {
      let defaultValue: number = this.unloadPointCatalogService.getUnloadAirFlow(this.selectedCompressor, true, this.settings);
      this.showAirflowCalc = (this.selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.airflow != defaultValue);
    } else {
      this.showAirflowCalc = false;
    }

    if (!this.selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.isDefaultPower) {
      let defaultValue: number = this.unloadPointCatalogService.getUnloadPower(this.selectedCompressor, true);
      this.showPowerCalc = (this.selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.power != defaultValue);
    } else {
      this.showPowerCalc = false;
    }

    if (!this.selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.isDefaultPressure) {
      let defaultValue: number = this.unloadPointCatalogService.getUnloadPressure(this.selectedCompressor, true, this.settings);
      this.showPressureCalc = (this.selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.dischargePressure != defaultValue);
    } else {
      this.showPressureCalc = false;
    }
  }

  setAirFlow() {
    let defaultValue: number = this.unloadPointCatalogService.getUnloadAirFlow(this.selectedCompressor, true, this.settings);
    this.form.controls.airflow.patchValue(defaultValue);
    this.form.controls.isDefaultAirFlow.patchValue(true);
    this.save();
  }

  setPower() {
    let defaultValue: number = this.unloadPointCatalogService.getUnloadPower(this.selectedCompressor, true);
    this.form.controls.power.patchValue(defaultValue);
    this.form.controls.isDefaultPower.patchValue(true);
    this.save();
  }

  setPressure() {
    let defaultValue: number = this.unloadPointCatalogService.getUnloadPressure(this.selectedCompressor, true, this.settings);
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
