import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { BoilerInput } from '../../../../shared/models/steam/steam-inputs';
import { BoilerOutput } from '../../../../shared/models/steam/steam-outputs';

@Component({
    selector: 'app-boiler-results',
    templateUrl: './boiler-results.component.html',
    styleUrls: ['./boiler-results.component.css'],
    standalone: false
})
export class BoilerResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  results: BoilerOutput;
  @Input()
  inputData: BoilerInput;

  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;

  constructor() { }

  ngOnInit() {
  }

  updateTable0String() {
    this.table0String = this.copyTable0.nativeElement.innerText;
  }
}
