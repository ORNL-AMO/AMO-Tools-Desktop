import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { TurbineOutput } from '../../../../shared/models/steam/steam-outputs';
import { SteamService } from '../../steam.service';

@Component({
  selector: 'app-turbine-results',
  templateUrl: './turbine-results.component.html',
  styleUrls: ['./turbine-results.component.css']
})
export class TurbineResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  results: TurbineOutput;
  energyMeasurement: string;

  @ViewChild('copyTable0') copyTable0: ElementRef;
  table0String: any;
  @ViewChild('copyTable1') copyTable1: ElementRef;
  table1String: any;
  @ViewChild('copyTable2') copyTable2: ElementRef;
  table2String: any;

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
      if (unit != 'kWh') {
        return this.steamService.getDisplayUnit(unit);
      }else{
        return 'kW'
      }
    } else {
      return unit;
    }
  }

  updateTable0String() {
    this.table0String = this.copyTable0.nativeElement.innerText;
  }

  updateTable1String() {
    this.table1String = this.copyTable1.nativeElement.innerText;
  }

  updateTable2String() {
    this.table2String = this.copyTable2.nativeElement.innerText;
  }
}
