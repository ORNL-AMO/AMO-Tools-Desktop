import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirItem, PerformancePoint } from '../../../../compressed-air-inventory';
import { CompressedAirInventoryService } from '../../../../compressed-air-inventory.service';
import { CompressedAirCatalogService } from '../../compressed-air-catalog.service';
import { PerformancePointsCatalogService } from '../performance-points-catalog.service';
import { MaxFullFlowCatalogService } from './max-full-flow-catalog.service';
import { Settings } from '../../../../../shared/models/settings';

@Component({
  selector: '[app-max-full-flow-catalog]',
  templateUrl: './max-full-flow-catalog.component.html',
  styleUrl: './max-full-flow-catalog.component.css'
})
export class MaxFullFlowCatalogComponent implements OnInit {


  settingsSub: Subscription;
  settings: Settings;
  selectedCompressorSub: Subscription;
  form: UntypedFormGroup;
  isFormChange: boolean = false;

  maxFullFlowLabel: string;
  //validationMessages: ValidationMessageMap;
  //warnings: PerformancePointWarnings;

  showPressureCalc: boolean;
  showAirflowCalc: boolean;
  showPowerCalc: boolean;
  selectedCompressor: CompressedAirItem;
  atmosphericPressure: number;
  inventoryDataSub: Subscription;
  constructor(private performancePointsCatalogService: PerformancePointsCatalogService,
    private compressedAirCatalogService: CompressedAirCatalogService,
    private compressedAirInventoryService: CompressedAirInventoryService,
    private maxFullFlowCatalogService: MaxFullFlowCatalogService) { }



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
        //this.warnings = this.performancePointsFormService.checkMotorServiceFactorExceededWarning(compressor.performancePoints.maxFullFlow.power, compressor);
        if (this.isFormChange == false) {
          this.setMaxFullFlowLabel(compressor.compressedAirControlsProperties.controlType);
          this.form = this.performancePointsCatalogService.getPerformancePointFormFromObj(compressor.compressedAirPerformancePointsProperties.maxFullFlow, compressor, 'maxFullFlow')
          //this.validationMessages = this.performancePointsFormService.validationMessageMap.getValue();
        } else {
          this.updateForm(compressor.compressedAirPerformancePointsProperties.maxFullFlow);
          this.isFormChange = false;
        }
      }
    });

  }

  setMaxFullFlowLabel(controlType: number) {
    if (controlType == 2 || controlType == 3) {
      this.maxFullFlowLabel = "(mod begins)";
    } else {
      this.maxFullFlowLabel = "(cut-out)";
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

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
    this.inventoryDataSub.unsubscribe();
  }

  save() {
    this.isFormChange = true;
    let maxFullFlow: PerformancePoint = this.performancePointsCatalogService.getPerformancePointObjFromForm(this.form);
    //TODO: CA Inventory
    //this.compressedAirDataManagementService.updateMaxFullFlow(maxFullFlow);
  }

  focusField(str: string) {
    this.compressedAirInventoryService.focusedField.next(str);
  }

  checkShowCalc() {
    if (!this.selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.isDefaultAirFlow) {
      let defaultValue: number = this.maxFullFlowCatalogService.getMaxFullFlowAirFlow(this.selectedCompressor, true, this.atmosphericPressure, this.settings);
      this.showAirflowCalc = (this.selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.airflow != defaultValue);
    } else {
      this.showAirflowCalc = false;
    }

    if (!this.selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.isDefaultPower) {
      let defaultValue: number = this.maxFullFlowCatalogService.getMaxFullFlowPower(this.selectedCompressor, true, this.atmosphericPressure, this.settings);
      this.showPowerCalc = (this.selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.power != defaultValue);
    } else {
      this.showPowerCalc = false;
    }

    if (!this.selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.isDefaultPressure) {
      let defaultValue: number = this.maxFullFlowCatalogService.getMaxFullFlowPressure(this.selectedCompressor, true, this.settings);
      this.showPressureCalc = (this.selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.dischargePressure != defaultValue);
    } else {
      this.showPressureCalc = false;
    }
  }

  setAirFlow() {
    let defaultValue: number = this.maxFullFlowCatalogService.getMaxFullFlowAirFlow(this.selectedCompressor, true, this.atmosphericPressure, this.settings);
    this.form.controls.airflow.patchValue(defaultValue);
    this.form.controls.isDefaultAirFlow.patchValue(true);
    this.save();
  }

  setPower() {
    let defaultValue: number = this.maxFullFlowCatalogService.getMaxFullFlowPower(this.selectedCompressor, true, this.atmosphericPressure, this.settings);
    this.form.controls.power.patchValue(defaultValue);
    this.form.controls.isDefaultPower.patchValue(true);
    this.save();
  }

  setPressure() {
    let defaultValue: number = this.maxFullFlowCatalogService.getMaxFullFlowPressure(this.selectedCompressor, true, this.settings);
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
