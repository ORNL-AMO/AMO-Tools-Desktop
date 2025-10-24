import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirItem, PerformancePoint } from '../../../../compressed-air-inventory';
import { CompressedAirInventoryService } from '../../../../compressed-air-inventory.service';
import { CompressedAirCatalogService } from '../../compressed-air-catalog.service';
import { PerformancePointsCatalogService, PerformancePointWarnings, ValidationMessageMap } from '../performance-points-catalog.service';
import { Settings } from '../../../../../shared/models/settings';
import { BlowoffCatalogService } from './blowoff-catalog.service';
import { CompressorDataManagementService } from '../../../../compressor-data-management.service';

@Component({
  selector: '[app-blowoff-catalog]',
  templateUrl: './blowoff-catalog.component.html',
  styleUrl: './blowoff-catalog.component.css',
  standalone: false
})
export class BlowoffCatalogComponent implements OnInit {
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
  constructor(private performancePointsCatalogService: PerformancePointsCatalogService,
    private compressedAirCatalogService: CompressedAirCatalogService,
    private compressedAirInventoryService: CompressedAirInventoryService,
    private blowoffCatalogService: BlowoffCatalogService,
    private compressedAirDataManagementService: CompressorDataManagementService,
  ) { }


  ngOnInit() {
    this.settings = this.compressedAirInventoryService.settings.getValue();
    this.selectedCompressorSub = this.compressedAirCatalogService.selectedCompressedAirItem.subscribe(compressor => {
      if (compressor) {
        this.selectedCompressor = compressor;
        this.checkShowCalc();
        this.warnings = this.performancePointsCatalogService.checkMotorServiceFactorExceededWarning(compressor.compressedAirPerformancePointsProperties.blowoff.power, compressor);
        if (this.isFormChange == false) {
          this.form = this.performancePointsCatalogService.getPerformancePointFormFromObj(compressor.compressedAirPerformancePointsProperties.blowoff, compressor, 'blowoff');
          this.validationMessages = this.performancePointsCatalogService.validationMessageMap.getValue();
        } else {
          this.updateForm(compressor.compressedAirPerformancePointsProperties.blowoff);
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
    let blowoff: PerformancePoint = this.performancePointsCatalogService.getPerformancePointObjFromForm(this.form);
    this.compressedAirDataManagementService.updateBlowoff(blowoff);
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
    if (!this.selectedCompressor.compressedAirPerformancePointsProperties.blowoff.isDefaultAirFlow) {
      let defaultValue: number = this.blowoffCatalogService.getBlowoffAirFlow(this.selectedCompressor, true, this.settings);
      this.showAirflowCalc = (this.selectedCompressor.compressedAirPerformancePointsProperties.blowoff.airflow != defaultValue);
    } else {
      this.showAirflowCalc = false;
    }

    if (!this.selectedCompressor.compressedAirPerformancePointsProperties.blowoff.isDefaultPower) {
      let defaultValue: number = this.blowoffCatalogService.getBlowoffPower(this.selectedCompressor, true);
      this.showPowerCalc = (this.selectedCompressor.compressedAirPerformancePointsProperties.blowoff.power != defaultValue);
    } else {
      this.showPowerCalc = false;
    }

    if (!this.selectedCompressor.compressedAirPerformancePointsProperties.blowoff.isDefaultPressure) {
      let defaultValue: number = this.blowoffCatalogService.getBlowoffDischargePressure(this.selectedCompressor, true, this.settings);
      this.showPressureCalc = (this.selectedCompressor.compressedAirPerformancePointsProperties.blowoff.dischargePressure != defaultValue);
    } else {
      this.showPressureCalc = false;
    }
  }

  setAirFlow() {
    let defaultValue: number = this.blowoffCatalogService.getBlowoffAirFlow(this.selectedCompressor, true, this.settings);
    this.form.controls.airflow.patchValue(defaultValue);
    this.form.controls.isDefaultAirFlow.patchValue(true);
    this.save();
  }

  setPower() {
    let defaultValue: number = this.blowoffCatalogService.getBlowoffPower(this.selectedCompressor, true);
    this.form.controls.power.patchValue(defaultValue);
    this.form.controls.isDefaultPower.patchValue(true);
    this.save();
  }

  setPressure() {
    let defaultValue: number = this.blowoffCatalogService.getBlowoffDischargePressure(this.selectedCompressor, true, this.settings);
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
