import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { TreasureHuntResults } from '../../../shared/models/treasure-hunt';

@Component({
    selector: 'app-cost-status',
    templateUrl: './cost-status.component.html',
    styleUrls: ['./cost-status.component.css'],
    standalone: false
})
export class CostStatusComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  combinedTreasureHuntResults: TreasureHuntResults;

  constructor() { }

  ngOnInit(): void {
  }
}
