import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-treasure-hunt-summary',
  templateUrl: './treasure-hunt-summary.component.html',
  styleUrls: ['./treasure-hunt-summary.component.css', '../report-summary.component.css']
})
export class TreasureHuntSummaryComponent implements OnInit {
  @Input()
  numTreasureHunt: number;
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit() {
  }

}
