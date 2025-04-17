import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { SteamService } from '../../steam.service';

@Component({
    selector: 'app-steam-properties-table',
    templateUrl: './steam-properties-table.component.html',
    styleUrls: ['./steam-properties-table.component.css'],
    standalone: false
})
export class SteamPropertiesTableComponent implements OnInit {
  @Input()
  toggleResetData: boolean;
  @Input()
  toggleExampleData: boolean;
  @Input()
  settings: Settings;
  @Input()
  data: { pressure: number, thermodynamicQuantity: number, temperature: number, enthalpy: number, entropy: number, volume: number, quality: number };

  rowData: Array<{ pressure: number, thermodynamicQuantity: number, temperature: number, enthalpy: number, entropy: number, volume: number, quality: number }>;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;
  constructor(private steamService: SteamService) { }

  ngOnInit() {
    if (this.steamService.steamPropertiesData) {
      this.rowData = this.steamService.steamPropertiesData;
    } else {
      this.rowData = new Array<{ pressure: number, thermodynamicQuantity: number, temperature: number, enthalpy: number, entropy: number, volume: number, quality: number }>();
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
    this.steamService.steamPropertiesData = this.rowData;
  }
  addRow() {
    if (this.data !== null) {
      this.rowData.push(this.data);
    }
  }

  resetTable() {
    this.rowData = new Array<{ pressure: number, thermodynamicQuantity: number, temperature: number, enthalpy: number, entropy: number, volume: number, quality: number }>();
    this.steamService.steamPropertiesData = this.rowData;
  }

  deleteRow(index: number) {
    this.rowData.splice(index, 1);
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText.replace(/Delete/g, '');
  }
}
