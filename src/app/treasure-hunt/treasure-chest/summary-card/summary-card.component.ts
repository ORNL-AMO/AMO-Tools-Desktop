import { Component, OnInit, Input } from '@angular/core';
import { TreasureHunt, TreasureHuntResults } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { Subscription } from 'rxjs';
import { TreasureHuntReportService } from '../../treasure-hunt-report/treasure-hunt-report.service';

@Component({
  selector: 'app-summary-card',
  templateUrl: './summary-card.component.html',
  styleUrls: ['./summary-card.component.css']
})
export class SummaryCardComponent implements OnInit {
  @Input()
  settings: Settings;

  treasureHuntResults: TreasureHuntResults;
  treasureHuntSub: Subscription;
  treasureHunt: TreasureHunt;
  constructor(
    private treasureHuntService: TreasureHuntService,
    private treasureHuntReportService: TreasureHuntReportService) { }

  ngOnInit() {
    this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
      this.treasureHunt = val;
      this.treasureHuntResults = this.treasureHuntReportService.calculateTreasureHuntResults(this.treasureHunt, this.settings);
    });
  }

  ngOnDestroy() {
    this.treasureHuntSub.unsubscribe();
  }

}
