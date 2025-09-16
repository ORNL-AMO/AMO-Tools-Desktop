import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { PrvOutput } from '../../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-prv-results',
    templateUrl: './prv-results.component.html',
    styleUrls: ['./prv-results.component.css'],
    standalone: false
})
export class PrvResultsComponent implements OnInit {
  @Input()
  results: PrvOutput;
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
