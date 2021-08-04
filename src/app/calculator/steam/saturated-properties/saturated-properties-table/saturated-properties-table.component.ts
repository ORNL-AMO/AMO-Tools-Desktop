import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { SteamService } from '../../steam.service';

@Component({
  selector: 'app-saturated-properties-table',
  templateUrl: './saturated-properties-table.component.html',
  styleUrls: ['./saturated-properties-table.component.css']
})
export class SaturatedPropertiesTableComponent implements OnInit {
  @Input()
  toggleResetData: boolean;
  @Input()
  toggleExampleData: boolean;
  @Input()
  settings: Settings;
  @Input()
  data: { pressure: number, temperature: number, satLiquidEnthalpy: number, evapEnthalpy: number, satGasEnthalpy: number, satLiquidEntropy: number, evapEntropy: number, satGasEntropy: number, satLiquidVolume: number, evapVolume: number, satGasVolume: number };

  rowData: Array<{ pressure: number, temperature: number, satLiquidEnthalpy: number, evapEnthalpy: number, satGasEnthalpy: number, satLiquidEntropy: number, evapEntropy: number, satGasEntropy: number, satLiquidVolume: number, evapVolume: number, satGasVolume: number }>;

  
  constructor(private steamService: SteamService) { }

  ngOnInit() {
    if (this.steamService.saturatedPropertiesData) {
      this.rowData = this.steamService.saturatedPropertiesData;
    } else {
      this.rowData = new Array<{ pressure: number, temperature: number, satLiquidEnthalpy: number, evapEnthalpy: number, satGasEnthalpy: number, satLiquidEntropy: number, evapEntropy: number, satGasEntropy: number, satLiquidVolume: number, evapVolume: number, satGasVolume: number }>();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.toggleResetData && !changes.toggleResetData.firstChange) {
      this.resetTable();
    } if (changes.toggleExampleData && !changes.toggleExampleData.firstChange) {
      //this.addRow();
    }
    if (changes.data && !changes.data.firstChange) {
      this.addRow();
    }
  }

  ngOnDestroy() {
    this.steamService.saturatedPropertiesData = this.rowData;
  }

  addRow() {
    if (this.data !== null) {
      this.rowData.push(this.data);
    }
  }

  resetTable() {
    this.rowData = new Array<{ pressure: number, temperature: number, satLiquidEnthalpy: number, evapEnthalpy: number, satGasEnthalpy: number, satLiquidEntropy: number, evapEntropy: number, satGasEntropy: number, satLiquidVolume: number, evapVolume: number, satGasVolume: number }>();
    this.steamService.saturatedPropertiesData = this.rowData;
  }

  deleteRow(index: number) {
    this.rowData.splice(index, 1);
  }
  
}
