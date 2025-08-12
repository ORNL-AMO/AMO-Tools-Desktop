import { Component, OnInit } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressorTypeOptions, CompressedAirItem, CompressedAirDesignDetailsPropertiesOptions, CompressorInventoryItemWarnings } from '../../../compressed-air-inventory';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';
import { CompressedAirCatalogService } from '../compressed-air-catalog.service';
import { DesignDetailsCatalogService } from './design-details-catalog.service';

@Component({
  selector: 'app-design-details-catalog',
  templateUrl: './design-details-catalog.component.html',
  styleUrl: './design-details-catalog.component.css',
  standalone: false
})
export class DesignDetailsCatalogComponent implements OnInit {
  settingsSub: Subscription;
  settings: Settings;

  form: FormGroup;
  selectedCompressedAirItemSub: Subscription;
  displayOptions: CompressedAirDesignDetailsPropertiesOptions;
  displayForm: boolean = true;
  displayBlowdownTime: boolean;
  displayModulation: boolean;
  displayNoLoadPowerFM: boolean;
  displayNoLoadPowerUL: boolean;
  displayMaxFullFlow: boolean;
  displayAverageLoadFactorAndMotorEfficiency: boolean;
  warnings: CompressorInventoryItemWarnings;

  compressorTypeOptions: Array<{ value: number, label: string }> = CompressorTypeOptions;
  invalidCompressorType: boolean;

  constructor(private compressedAirCatalogService: CompressedAirCatalogService, private compressedAirInventoryService: CompressedAirInventoryService,
    private designDetailsCatalogService: DesignDetailsCatalogService) { }

  ngOnInit(): void {
    this.settingsSub = this.compressedAirInventoryService.settings.subscribe(val => {
      this.settings = val;
    });
    this.selectedCompressedAirItemSub = this.compressedAirCatalogService.selectedCompressedAirItem.subscribe(selectedCompressedAir => {
      this.warnings = this.compressedAirCatalogService.checkWarnings(selectedCompressedAir);
      if (selectedCompressedAir) {
        this.form = this.designDetailsCatalogService.getFormFromDesignDetails(selectedCompressedAir.compressedAirDesignDetailsProperties, selectedCompressedAir.nameplateData.compressorType, selectedCompressedAir.compressedAirControlsProperties.controlType);
        this.setDisplayBlowdownTime(selectedCompressedAir.nameplateData.compressorType, selectedCompressedAir.compressedAirControlsProperties.controlType);
        this.setDisplayModulation(selectedCompressedAir.compressedAirControlsProperties.controlType)
        this.setDisplayMaxFullFlow(selectedCompressedAir.nameplateData.compressorType, selectedCompressedAir.compressedAirControlsProperties.controlType);
        this.setDisplayNoLoadPowerFM(selectedCompressedAir.nameplateData.compressorType, selectedCompressedAir.compressedAirControlsProperties.controlType);
        this.setDisplayNoLoadPowerUL(selectedCompressedAir.nameplateData.compressorType, selectedCompressedAir.compressedAirControlsProperties.controlType);
        this.setDisplayAverageLoadFactorAndMotorEfficiencyAtLoad(selectedCompressedAir.compressedAirControlsProperties.controlType);
        this.setCalculatedModulatingPressureRange(selectedCompressedAir);
      }
    });
    this.displayOptions = this.compressedAirInventoryService.compressedAirInventoryData.getValue().displayOptions.compressedAirDesignDetailsPropertiesOptions;
  }

  ngOnDestroy() {
    this.selectedCompressedAirItemSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  save() {
    let selectedCompressedAir: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressedAir.compressedAirDesignDetailsProperties = this.designDetailsCatalogService.updateDesignDetailsFromForm(this.form, selectedCompressedAir.compressedAirDesignDetailsProperties);
    this.compressedAirInventoryService.updateCompressedAirItem(selectedCompressedAir);
  }

  focusField(str: string) {
    this.compressedAirInventoryService.focusedDataGroup.next('nameplate-data');
    this.compressedAirInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  setDisplayBlowdownTime(compressorType: number, controlType: number) {
    this.displayBlowdownTime = this.designDetailsCatalogService.checkDisplayBlowdownTime(compressorType, controlType);
  }

  setDisplayModulation(controlType: number) {
    this.displayModulation = this.designDetailsCatalogService.checkDisplayModulation(controlType);
  }

  setDisplayNoLoadPowerFM(compressorType: number, controlType: number) {
    this.displayNoLoadPowerFM = this.designDetailsCatalogService.checkDisplayNoLoadPowerFM(compressorType, controlType);
  }

  setDisplayNoLoadPowerUL(compressorType: number, controlType: number) {
    this.displayNoLoadPowerUL = this.designDetailsCatalogService.checkDisplayNoLoadPowerUL(compressorType, controlType);
  }

  setDisplayMaxFullFlow(compressorType: number, controlType: number) {
    this.displayMaxFullFlow = this.designDetailsCatalogService.checkShowMaxFlowPerformancePoint(compressorType, controlType);
  }

  setDisplayAverageLoadFactorAndMotorEfficiencyAtLoad(controlType: number) {
    this.displayAverageLoadFactorAndMotorEfficiency = this.designDetailsCatalogService.checkShowAverageLoadFactorAndMotorEfficiency(controlType);
  }

  setCalculatedModulatingPressureRange(selectedCompressor: CompressedAirItem) {
    if (this.displayModulation) {
      let pressureRange: number;
      if (selectedCompressor.compressedAirControlsProperties.controlType != 1) {
        pressureRange = (selectedCompressor.compressedAirPerformancePointsProperties.unloadPoint.dischargePressure - selectedCompressor.compressedAirPerformancePointsProperties.maxFullFlow.dischargePressure) / (1 - (selectedCompressor.compressedAirControlsProperties.unloadPointCapacity / 100));
        pressureRange = Number(pressureRange.toFixed(1));
      } else {
        pressureRange = selectedCompressor.compressedAirPerformancePointsProperties.noLoad.dischargePressure - selectedCompressor.compressedAirPerformancePointsProperties.fullLoad.dischargePressure;
      }
      if (isNaN(pressureRange) == false && pressureRange != this.form.controls.modulatingPressureRange.value) {
        this.form.controls.modulatingPressureRange.patchValue(pressureRange);
        this.save();
      }
    }
  }

}