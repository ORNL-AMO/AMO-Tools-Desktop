import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { HeaderOutputObj } from '../../../../shared/models/steam/steam-outputs';
import { SteamService } from '../../steam.service';

@Component({
  selector: 'app-header-results',
  templateUrl: './header-results.component.html',
  styleUrls: ['./header-results.component.css']
})
export class HeaderResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  results: HeaderOutputObj;
  @Input()
  name: string;
  energyMeasurement: string;

  @ViewChild('copyTable') copyTable: ElementRef;
  tableString: any;

  constructor(private steamService: SteamService) { }

  ngOnInit() {
    if (this.settings.steamEnergyMeasurement == 'kWh') {
      this.energyMeasurement = 'kW';
    } else {
      this.energyMeasurement = this.settings.steamEnergyMeasurement + '/hr';
    }
  }

  getDisplayUnit(unit: string) {
    if (unit) {
      return this.steamService.getDisplayUnit(unit);
    } else {
      return unit;
    }
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}
