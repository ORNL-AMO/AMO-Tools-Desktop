import { Component, OnInit, Input } from '@angular/core';
import { SSMTLosses } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';


@Component({
  selector: 'app-losses-summary',
  templateUrl: './losses-summary.component.html',
  styleUrls: ['./losses-summary.component.css']
})
export class LossesSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  baselineLosses: SSMTLosses;
  @Input()
  modificationLosses: Array<{ outputData: SSMTLosses, name: string }>;
  @Input()
  numberOfHeaders: number;
  @Input()
  tableCellWidth: number;
  
  constructor() { }

  ngOnInit() {
  }

}
