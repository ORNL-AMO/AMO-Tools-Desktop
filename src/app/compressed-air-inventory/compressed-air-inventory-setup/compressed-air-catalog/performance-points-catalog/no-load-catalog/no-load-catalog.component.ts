import { Component, OnInit } from '@angular/core';
import { Settings } from '../../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirItem, PerformancePoint } from '../../../../compressed-air-inventory';
import { CompressedAirInventoryService } from '../../../../compressed-air-inventory.service';
import { CompressedAirCatalogService } from '../../compressed-air-catalog.service';
import { PerformancePointsCatalogService } from '../performance-points-catalog.service';
import { NoLoadCatalogService } from './no-load-catalog.service';

@Component({
  selector: '[app-no-load-catalog]',
  templateUrl: './no-load-catalog.component.html',
  styleUrl: './no-load-catalog.component.css'
})
export class NoLoadCatalogComponent implements OnInit {


  settingsSub: Subscription;
  settings: Settings;
  selectedCompressorSub: Subscription;
  form: UntypedFormGroup;
  isFormChange: boolean = false;
  noLoadLabel: string;
  //validationMessages: ValidationMessageMap;
  //warnings: PerformancePointWarnings;

  showPressureCalc: boolean;
  showAirflowCalc: boolean;
  showPowerCalc: boolean;
  selectedCompressor: CompressedAirItem;
  constructor(private performancePointsCatalogService: PerformancePointsCatalogService,
    private compressedAirCatalogService: CompressedAirCatalogService,
    private compressedAirInventoryService: CompressedAirInventoryService,
    private noLoadCatalogService: NoLoadCatalogService) { }



  ngOnInit(): void {
    this.settingsSub = this.compressedAirInventoryService.settings.subscribe(val => {
      this.settings = val;
    });
    //this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.selectedCompressorSub = this.compressedAirCatalogService.selectedCompressedAirItem.subscribe(compressor => {
      if (compressor) {
        this.selectedCompressor = compressor;
        this.checkShowCalc();
        //this.warnings = this.performancePointsFormService.checkMotorServiceFactorExceededWarning(compressor.performancePoints.noLoad.power, compressor);
        if (this.isFormChange == false) {
          this.setNoLoadLabel(compressor.compressedAirControlsProperties.controlType);
          this.form = this.performancePointsCatalogService.getPerformancePointFormFromObj(compressor.compressedAirPerformancePointsProperties.noLoad, compressor, 'noLoad')
          //this.validationMessages = this.performancePointsFormService.validationMessageMap.getValue();
        } else {
          this.updateForm(compressor.compressedAirPerformancePointsProperties.noLoad);
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
    let noLoad: PerformancePoint = this.performancePointsCatalogService.getPerformancePointObjFromForm(this.form);
    //TODO: CA Inventory
    //this.compressedAirDataManagementService.updateNoLoad(noLoad);
  }

  focusField(str: string) {
    this.compressedAirInventoryService.focusedField.next(str);
  }

  setNoLoadLabel(controlType: number) {
    if (controlType == 4 || controlType == 5 || controlType == 2 || controlType == 3 || controlType == 8 || controlType == 10) {
      this.noLoadLabel = "(unloaded)";
    } else if (controlType == 6) {
      this.noLoadLabel = "(off)";
    } else if (controlType == 1) {
      this.noLoadLabel = "(modulated)";
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
    if (!this.selectedCompressor.compressedAirPerformancePointsProperties.noLoad.isDefaultAirFlow) {
      let defaultValue: number = this.noLoadCatalogService.getNoLoadAirFlow(this.selectedCompressor, true);
      this.showAirflowCalc = (this.selectedCompressor.compressedAirPerformancePointsProperties.noLoad.airflow != defaultValue);
    } else {
      this.showAirflowCalc = false;
    }

    if (!this.selectedCompressor.compressedAirPerformancePointsProperties.noLoad.isDefaultPower) {
      let defaultValue: number = this.noLoadCatalogService.getNoLoadPower(this.selectedCompressor, true);
      this.showPowerCalc = (this.selectedCompressor.compressedAirPerformancePointsProperties.noLoad.power != defaultValue);
    } else {
      this.showPowerCalc = false;
    }

    if (!this.selectedCompressor.compressedAirPerformancePointsProperties.noLoad.isDefaultPressure) {
      let defaultValue: number = this.noLoadCatalogService.getNoLoadPressure(this.selectedCompressor, true, this.settings);
      this.showPressureCalc = (this.selectedCompressor.compressedAirPerformancePointsProperties.noLoad.dischargePressure != defaultValue);
    } else {
      this.showPressureCalc = false;
    }
  }

  setAirFlow() {
    let defaultValue: number = this.noLoadCatalogService.getNoLoadAirFlow(this.selectedCompressor, true);
    this.form.controls.airflow.patchValue(defaultValue);
    this.form.controls.isDefaultAirFlow.patchValue(true);
    this.save();
  }

  setPower() {
    let defaultValue: number = this.noLoadCatalogService.getNoLoadPower(this.selectedCompressor, true);
    this.form.controls.power.patchValue(defaultValue);
    this.form.controls.isDefaultPower.patchValue(true);
    this.save();
  }

  setPressure() {
    let defaultValue: number = this.noLoadCatalogService.getNoLoadPressure(this.selectedCompressor, true, this.settings);
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
