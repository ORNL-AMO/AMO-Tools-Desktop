import {Component, OnInit, Input, ElementRef, ViewChild, SimpleChanges} from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { TurbineOutput } from '../../../../shared/models/steam/steam-outputs';

@Component({
    selector: 'app-turbine-results',
    templateUrl: './turbine-results.component.html',
    styleUrls: ['./turbine-results.component.css'],
    standalone: false
})
export class TurbineResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  results: TurbineOutput;
  @Input()
  toggleGenerateExample: boolean;

  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;
  constructor() { }

  ngOnInit() {
  }

  updateTable0String() {
    this.table0String = this.copyTable0.nativeElement.innerText;
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.toggleGenerateExample) {
      // Logic for Table Update
    }
  }
}
