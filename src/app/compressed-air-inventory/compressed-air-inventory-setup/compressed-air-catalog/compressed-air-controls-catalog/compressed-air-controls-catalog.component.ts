import { Component, OnInit } from '@angular/core';
import { CompressedAirControlsPropertiesOptions, CompressedAirItem, CompressorTypeOptions, ControlTypes } from '../../../compressed-air-inventory';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';
import { CompressedAirCatalogService } from '../compressed-air-catalog.service';
import { CompressedAirControlsCatalogService } from './compressed-air-controls-catalog.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-compressed-air-controls-catalog',
  templateUrl: './compressed-air-controls-catalog.component.html',
  styleUrl: './compressed-air-controls-catalog.component.css',
  standalone: false
})
export class CompressedAirControlsCatalogComponent implements OnInit {
  settingsSub: Subscription;
  settings: Settings;
  form: FormGroup;
  selectedCompressedAirItemSub: Subscription;
  displayOptions: CompressedAirControlsPropertiesOptions;
  displayForm: boolean = true;
  displayUnload: boolean;
  displayAutomaticShutdown: boolean;
  displayUnloadSumpPressure: boolean;
  compressorType: number;

  controlTypeOptions: Array<{ value: number, label: string, compressorTypes: Array<number> }>;

  constructor(private compressedAirCatalogService: CompressedAirCatalogService, private compressedAirInventoryService: CompressedAirInventoryService,
    private compressedAirControlsCatalogService: CompressedAirControlsCatalogService) { }

  ngOnInit(): void {
    this.settingsSub = this.compressedAirInventoryService.settings.subscribe(val => {
      this.settings = val;
    });
    this.selectedCompressedAirItemSub = this.compressedAirCatalogService.selectedCompressedAirItem.subscribe(selectedCompressedAir => {
      if (selectedCompressedAir) {
        this.compressorType = selectedCompressedAir.nameplateData.compressorType;
        this.form = this.compressedAirControlsCatalogService.getFormFromControlsProperties(selectedCompressedAir.compressedAirControlsProperties, selectedCompressedAir.nameplateData.compressorType);
        this.toggleDisableControls();
        this.setControlTypeOptions(selectedCompressedAir.nameplateData.compressorType);
        this.setDisplayValues();
      }
    });
    this.displayOptions = this.compressedAirInventoryService.compressedAirInventoryData.getValue().displayOptions.compressedAirControlsPropertiesOptions;
  }

  setControlTypeOptions(compressorType: number) {
    if (compressorType) {
      this.controlTypeOptions = ControlTypes.filter(type => { return type.compressorTypes.includes(compressorType) });
    } else {
      this.controlTypeOptions = [];
    }
    let controlOptionSelected: { value: number, label: string, compressorTypes: Array<number> } = this.controlTypeOptions.find(option => {
      return option.value == this.form.controls.controlType.value;
    });

    if (!controlOptionSelected && this.controlTypeOptions.length != 0) {
      // Has controlType from previously selected compressorType, set default for new compressorType
      this.form.controls.controlType.patchValue(this.controlTypeOptions[0].value);
      this.changeControlType();
    }
  }

  changeControlType() {
    this.form = this.compressedAirControlsCatalogService.setCompressorControlValidators(this.form);
    if (this.form.controls.controlType.value == 2 || this.form.controls.controlType.value == 3
      || this.form.controls.controlType.value == 4 || this.form.controls.controlType.value == 6 || this.form.controls.controlType.value == 5) {
      this.form.controls.numberOfUnloadSteps.patchValue(2);
    }
    if (this.form.controls.controlType.value == 4 || this.form.controls.controlType.value == 6 || this.form.controls.controlType.value == 7 || this.form.controls.controlType.value == 5) {
      this.form.controls.unloadPointCapacity.patchValue(100);
    }
    if (this.form.controls.controlType.value == 11) {
      this.form.controls.unloadPointCapacity.patchValue(20);
    }
    this.toggleDisableControls();
    this.setDisplayValues();
    this.save();
  }

  ngOnDestroy() {
    this.selectedCompressedAirItemSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  save() {
    let selectedCompressedAir: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressedAir.compressedAirControlsProperties = this.compressedAirControlsCatalogService.updateControlsPropertiesFromForm(this.form, selectedCompressedAir.compressedAirControlsProperties);
    this.compressedAirInventoryService.updateCompressedAirItem(selectedCompressedAir);
  }

  focusField(str: string) {
    this.compressedAirInventoryService.focusedDataGroup.next('controls');
    this.compressedAirInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  toggleDisableControls() {
    if (this.form.controls.controlType.value == 4 || this.form.controls.controlType.value == 7 || this.form.controls.controlType.value == 5) {
      this.form.controls.unloadPointCapacity.disable();
    } else {
      this.form.controls.unloadPointCapacity.enable();
    }

    if (this.form.controls.controlType.value == 2 || this.form.controls.controlType.value == 3
      || this.form.controls.controlType.value == 4) {
      this.form.controls.numberOfUnloadSteps.disable();
    } else {
      this.form.controls.numberOfUnloadSteps.enable();
    }
  }

  setDisplayValues() {
    this.displayUnload = this.compressedAirControlsCatalogService.checkDisplayUnloadCapacity(this.form.controls.controlType.value);
    this.displayAutomaticShutdown = this.compressedAirControlsCatalogService.checkDisplayAutomaticShutdown(this.form.controls.controlType.value);
    this.displayUnloadSumpPressure = this.compressedAirControlsCatalogService.checkDisplayUnloadSlumpPressure(this.compressorType, this.form.controls.controlType.value)
  }

}
