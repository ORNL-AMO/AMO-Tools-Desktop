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

  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;
  constructor() { }

  ngOnInit() {
  }

  updateTable0String() {
    this.table0String = this.copyTable0.nativeElement.innerText;
  }
}
