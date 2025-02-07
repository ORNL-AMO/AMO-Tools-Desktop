import { Component, OnInit } from '@angular/core';
import { CompressedAirItem, CompressedAirPerformancePointsPropertiesOptions } from '../../../compressed-air-inventory';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';
import { CompressedAirCatalogService } from '../compressed-air-catalog.service';
import { PerformancePointsCatalogService } from './performance-points-catalog.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-performance-points-catalog',
  templateUrl: './performance-points-catalog.component.html',
  styleUrl: './performance-points-catalog.component.css'
})
export class PerformancePointsCatalogComponent implements OnInit {
  settingsSub: Subscription;
  settings: Settings;

  form: FormGroup;
  selectedCompressedAirItemSub: Subscription;
  displayOptions: CompressedAirPerformancePointsPropertiesOptions;
  displayForm: boolean = true;
  showMaxFullFlow: boolean;
  showMidTurndown: boolean;
  showTurndown: boolean;
  showUnload: boolean;
  showNoLoad: boolean;
  showBlowoff: boolean;
  hasValidPerformancePoints: boolean = true;


  constructor(private compressedAirCatalogService: CompressedAirCatalogService, private compressedAirInventoryService: CompressedAirInventoryService,
    private performancePointsCatalogService: PerformancePointsCatalogService) { }

  ngOnInit(): void {
    this.settingsSub = this.compressedAirInventoryService.settings.subscribe(val => {
      this.settings = val;
    });
    this.selectedCompressedAirItemSub = this.compressedAirCatalogService.selectedCompressedAirItem.subscribe(selectedCompressedAir => {
      if (selectedCompressedAir) {
        //this.form = this.nameplateDataCatalogService.getFormFromNameplateData(selectedCompressedAir.nameplateData);
        //this.hasValidPerformancePoints = this.performancePointsCatalogService.checkPerformancePointsValid(selectedCompressedAir, selectedCompressedAir.systemInformation);
        this.setShowMidTurndown(selectedCompressedAir);
        this.setShowTurndown(selectedCompressedAir);
        this.setShowMaxFlow(selectedCompressedAir);
        this.setShowUnload(selectedCompressedAir);
        this.setShowNoLoad(selectedCompressedAir);
        this.setShowBlowoff(selectedCompressedAir);

      }
    });
    this.displayOptions = this.compressedAirInventoryService.compressedAirInventoryData.getValue().displayOptions.compressedAirPerformancePointsPropertiesOptions;
  }

  ngOnDestroy() {
    this.selectedCompressedAirItemSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  save() {
    let selectedCompressedAir: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    //selectedCompressedAir.nameplateData = this.nameplateDataCatalogService.updateNameplateDataFromForm(this.form, selectedCompressedAir.nameplateData);
    this.compressedAirInventoryService.updateCompressedAirItem(selectedCompressedAir);
  }

  focusField(str: string) {
    this.compressedAirInventoryService.focusedDataGroup.next('nameplate-data');
    this.compressedAirInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  setShowMaxFlow(selectedCompressor: CompressedAirItem) {
    this.showMaxFullFlow = this.performancePointsCatalogService.checkShowMaxFlowPerformancePoint(selectedCompressor.nameplateData.compressorType, selectedCompressor.compressedAirControlsProperties.controlType);
  }

  setShowMidTurndown(selectedCompressor: CompressedAirItem) {
    this.showMidTurndown = this.performancePointsCatalogService.checkShowMidTurndown(selectedCompressor.compressedAirControlsProperties.controlType);
  }

  setShowTurndown(selectedCompressor: CompressedAirItem) {
    this.showTurndown = this.performancePointsCatalogService.checkShowTurndown(selectedCompressor.compressedAirControlsProperties.controlType);
  }

  setShowUnload(selectedCompressor: CompressedAirItem) {
    this.showUnload = this.performancePointsCatalogService.checkShowUnloadPerformancePoint(selectedCompressor.nameplateData.compressorType, selectedCompressor.compressedAirControlsProperties.controlType);
  }

  setShowNoLoad(selectedCompressor: CompressedAirItem) {
    this.showNoLoad = this.performancePointsCatalogService.checkShowNoLoadPerformancePoint(selectedCompressor.nameplateData.compressorType, selectedCompressor.compressedAirControlsProperties.controlType);
  }

  setShowBlowoff(selectedCompressor: CompressedAirItem) {
    this.showBlowoff = this.performancePointsCatalogService.checkShowBlowoffPerformancePoint(selectedCompressor.nameplateData.compressorType, selectedCompressor.compressedAirControlsProperties.controlType);

  }

}
