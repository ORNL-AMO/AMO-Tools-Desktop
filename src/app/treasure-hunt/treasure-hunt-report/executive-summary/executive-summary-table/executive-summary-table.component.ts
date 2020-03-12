import { Component, OnInit, Input } from '@angular/core';
import { TreasureHuntResults } from '../../../../shared/models/treasure-hunt';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-executive-summary-table',
  templateUrl: './executive-summary-table.component.html',
  styleUrls: ['./executive-summary-table.component.css']
})
export class ExecutiveSummaryTableComponent implements OnInit {
  @Input()
  treasureHuntResults: TreasureHuntResults;
  @Input()
  showFullSummary: boolean;
  @Input()
  settings: Settings;
  @Input()
  title: string;

  constructor() { }

  ngOnInit(): void {
  }

}
