import { Component, OnInit, Input } from '@angular/core';
import { TreasureHuntResults } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-executive-summary',
  templateUrl: './executive-summary.component.html',
  styleUrls: ['./executive-summary.component.css']
})
export class ExecutiveSummaryComponent implements OnInit {
  @Input()
  treasureHuntResults: TreasureHuntResults;
  @Input()
  settings: Settings;
  @Input()
  showFullSummary: boolean;
  @Input()
  title: string;
  
  constructor() { }

  ngOnInit() {
  }

}
