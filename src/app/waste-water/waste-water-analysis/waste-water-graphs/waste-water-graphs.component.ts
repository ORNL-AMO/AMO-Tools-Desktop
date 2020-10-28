import { Component, OnInit } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { WasteWater, WasteWaterResults } from '../../../shared/models/waste-water';
import { WasteWaterService } from '../../waste-water.service';

@Component({
  selector: 'app-waste-water-graphs',
  templateUrl: './waste-water-graphs.component.html',
  styleUrls: ['./waste-water-graphs.component.css']
})
export class WasteWaterGraphsComponent implements OnInit {

  constructor(private wasteWaterService: WasteWaterService) { }

  ngOnInit(): void {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    let settings: Settings = this.wasteWaterService.settings.getValue();
    let results: WasteWaterResults = this.wasteWaterService.calculateResults(wasteWater.baselineData.activatedSludgeData, wasteWater.baselineData.aeratorPerformanceData, wasteWater.systemBasics, settings);
    console.log(results);
  }

}
