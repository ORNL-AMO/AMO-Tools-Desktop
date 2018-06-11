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
  settings: Settings;
  @Input()
  data: { pressure: number, temperature: number, satLiquidEnthalpy: number, evapEnthalpy: number, satGasEnthalpy: number, satLiquidEntropy: number, evapEntropy: number, satGasEntropy: number, satLiquidVolume: number, evapVolume: number, satGasVolume: number };

  rowData: Array<{ pressure: number, temperature: number, satLiquidEnthalpy: number, evapEnthalpy: number, satGasEnthalpy: number, satLiquidEntropy: number, evapEntropy: number, satGasEntropy: number, satLiquidVolume: number, evapVolume: number, satGasVolume: number }>;

  pressureUnits: string;
  tempUnits: string;
  enthalpyUnits: string;
  entropyUnits: string;
  volumeUnits: string;

  constructor(private steamService: SteamService) { }

  ngOnInit() {
    this.rowData = new Array<{ pressure: number, temperature: number, satLiquidEnthalpy: number, evapEnthalpy: number, satGasEnthalpy: number, satLiquidEntropy: number, evapEntropy: number, satGasEntropy: number, satLiquidVolume: number, evapVolume: number, satGasVolume: number }>();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && !changes.data.firstChange) {
      this.addRow();
    }
  }

  addRow() {
    if(this.data !== null) {
      this.rowData.push(this.data);
    }
  }

  deleteRow(index: number) {
    this.rowData.splice(index, 1);
  }

  getDisplayUnit(unit: string) {
    return this.steamService.getDisplayUnit(unit);
  }
}
