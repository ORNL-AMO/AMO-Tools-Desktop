import { Component } from '@angular/core';
import { CompressedAirInventoryService, FilterInventorySummary } from '../../../compressed-air-inventory.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirInventoryData, CompressedAirInventorySystem } from '../../../compressed-air-inventory';

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

  clearAllFilters() {
    this.filterInventorySummary = {
      selectedSystemsIds: [],
      compressorTypes: [],
      controlTypes: []
    }
    this.save();
  }

}
