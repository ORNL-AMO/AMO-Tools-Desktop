import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { DeaeratorOutput } from '../../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-deaerator-results',
    templateUrl: './deaerator-results.component.html',
    styleUrls: ['./deaerator-results.component.css'],
    standalone: false
})
export class DeaeratorResultsComponent implements OnInit {
  @Input()
  results: DeaeratorOutput;
  @Input()
  settings: Settings;

  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;
  constructor() { }

  ngOnInit() {
  }

  updateTable0String() {
    this.table0String = this.copyTable0.nativeElement.innerText;
  }
}
