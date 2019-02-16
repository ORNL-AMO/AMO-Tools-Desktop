import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { PrvOutput } from '../../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../../shared/models/settings';
import { SteamService } from '../../steam.service';

@Component({
  selector: 'app-prv-results',
  templateUrl: './prv-results.component.html',
  styleUrls: ['./prv-results.component.css']
})
export class PrvResultsComponent implements OnInit {
  @Input()
  results: PrvOutput;
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
