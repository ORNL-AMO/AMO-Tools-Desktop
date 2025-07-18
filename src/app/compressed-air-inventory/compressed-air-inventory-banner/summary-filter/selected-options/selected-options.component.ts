import { Component } from '@angular/core';
import { CompressedAirInventoryService, FilterInventorySummary } from '../../../compressed-air-inventory.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirInventoryData, CompressedAirInventorySystem, CompressorTypeOptions, ControlTypes } from '../../../compressed-air-inventory';

@Component({
  selector: 'app-selected-options',
  templateUrl: './selected-options.component.html',
  styleUrl: './selected-options.component.css',
  standalone: false
})
export class SelectedOptionsComponent {

  settings: Settings;
  filterInventorySummarySub: Subscription;
  filterInventorySummary: FilterInventorySummary;
  compressorTypeOptions: Array<{ value: number, label: string }> = CompressorTypeOptions;

  controlTypesOptions: Array<{ value: number, label: string }> = ControlTypes;

  compressedAirInventoryData: CompressedAirInventoryData;
  constructor(
    private compressedAirInventoryService: CompressedAirInventoryService,
    //private pumpSummaryGraphsService: PumpSummaryGraphsService
  ) { }

  ngOnInit(): void {
    this.settings = this.compressedAirInventoryService.settings.getValue();
    this.compressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();
    this.filterInventorySummarySub = this.compressedAirInventoryService.filterInventorySummary.subscribe(val => {
      this.filterInventorySummary = val;
    });
  }

  ngOnDestroy() {
    this.filterInventorySummarySub.unsubscribe();
  }

  save() {
    this.compressedAirInventoryService.filterInventorySummary.next(this.filterInventorySummary);
    //let selectedField = this.pumpSummaryGraphsService.selectedField.getValue();
    //this.pumpSummaryGraphsService.selectedField.next(selectedField);
  }

  removeSystem(index: number) {
    this.filterInventorySummary.selectedSystemsIds.splice(index, 1);
    this.save();
  }

  getSystemName(id: string): string {
    let system: CompressedAirInventorySystem = this.compressedAirInventoryData.systems.find(system => { return system.id == id });
    return system.name;
  }

  removeCompressorType(index: number) {
    this.filterInventorySummary.compressorTypes.splice(index, 1);
    this.save();
  }

  getCompressorTypeName(compressorType: number): string {
    let compressorTypeOption = this.compressorTypeOptions.find(option => option.value === compressorType);
    return compressorTypeOption.label;
  }

  removeControlType(index: number) {
    this.filterInventorySummary.controlTypes.splice(index, 1);
    this.save();
  }

  getControlTypeName(controlType: number): string {
    let controlTypeOption = this.controlTypesOptions.find(option => option.value === controlType);
    return controlTypeOption.label;
  }

  removeHorsepowerType(index: number) {
    this.filterInventorySummary.horsepowerTypes.splice(index, 1);
    this.save();
  }

  // getHorsepowerTypeName(horsepowerType: number): string {
  //   let horsepowerTypeOption = this.compressorTypeOptions.find(option => option.value === horsepowerType);
  //   return horsepowerTypeOption.label;
  // }


  clearAllFilters() {
    this.filterInventorySummary = {
      selectedSystemsIds: [],
      compressorTypes: [],
      controlTypes: [],
      horsepowerTypes: [],
    }
    this.save();
  }

}
