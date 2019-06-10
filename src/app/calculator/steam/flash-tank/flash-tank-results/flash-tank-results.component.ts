import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FlashTankOutput } from '../../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../../shared/models/settings';
import { SteamService } from '../../steam.service';

@Component({
  selector: 'app-flash-tank-results',
  templateUrl: './flash-tank-results.component.html',
  styleUrls: ['./flash-tank-results.component.css']
})
export class FlashTankResultsComponent implements OnInit {
  @Input()
  results: FlashTankOutput;
  @Input()
  settings: Settings;

  @ViewChild('copyTable0') copyTable0: ElementRef;
  table0String: any;

  constructor() { }

  ngOnInit() {
  }

  updateTable0String() {
    this.table0String = this.copyTable0.nativeElement.innerText;
  }
}
