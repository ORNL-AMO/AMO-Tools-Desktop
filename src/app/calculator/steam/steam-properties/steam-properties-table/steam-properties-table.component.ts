import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { SteamService } from '../../steam.service';

@Component({
  selector: 'app-steam-properties-table',
  templateUrl: './steam-properties-table.component.html',
  styleUrls: ['./steam-properties-table.component.css']
})
export class SteamPropertiesTableComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  data: { pressure: number, thermodynamicQuantity: number, temperature: number, enthalpy: number, entropy: number, volume: number };

  // rows: Array<{ pressure: number, quality: number, temperature: number, enthalpy: number, entropy: number, volume: number }>;
  rowData: Array<{ pressure: number, thermodynamicQuantity: number, temperature: number, enthalpy: number, entropy: number, volume: number }>;

  pressureUnits: string;
  tempUnits: string;
  enthalpyUnits: string;
  entropyUnits: string;
  volumeUnits: string;


  constructor(private steamService: SteamService) { }

  ngOnInit() {
    this.rowData = new Array<{ pressure: number, thermodynamicQuantity: number, temperature: number, enthalpy: number, entropy: number, volume: number }>();

  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('table changes');
    console.log(changes);
    if (changes.data && !changes.data.firstChange) {
      this.addRow();
    }
  }

  addRow() {
    if (this.data !== null) {
      this.rowData.push(this.data);
    }
  }

  deleteRow(index: number) {
    this.rowData.splice(index, 1);
  }

  getDisplayUnit(unit: string) {
    return this.steamService.getDisplayUnit(unit);
  }

  columnHover() {
    console.log('columnHover');
  }

  rowHover() {

  }

}
