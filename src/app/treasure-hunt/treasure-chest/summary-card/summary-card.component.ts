import { Component, OnInit, Input } from '@angular/core';
import { TreasureHunt, OpportunitySheetResults, TreasureHuntResults } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import { OpportunitySheetService } from '../../standalone-opportunity-sheet/opportunity-sheet.service';
import { LightingReplacementService } from '../../../calculator/lighting/lighting-replacement/lighting-replacement.service';
import { LightingReplacementResults } from '../../../shared/models/lighting';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { Subscription } from 'rxjs';
import { ReplaceExistingService } from '../../../calculator/motors/replace-existing/replace-existing.service';
import { ReplaceExistingResults, MotorDriveOutputs } from '../../../shared/models/calculators';
import { MotorDriveService } from '../../../calculator/motors/motor-drive/motor-drive.service';
import { TreasureHuntReportService } from '../../treasure-hunt-report/treasure-hunt-report.service';

@Component({
  selector: 'app-summary-card',
  templateUrl: './summary-card.component.html',
  styleUrls: ['./summary-card.component.css']
})
export class SummaryCardComponent implements OnInit {
  @Input()
  treasureHunt: TreasureHunt;
  @Input()
  settings: Settings;

  treasureHuntResults: TreasureHuntResults;

  getResultsSubscription: Subscription;
  constructor(
    private treasureHuntService: TreasureHuntService,
    private treasureHuntReportService: TreasureHuntReportService) { }

  ngOnInit() {
    this.getResultsSubscription = this.treasureHuntService.getResults.subscribe(val => {
      this.treasureHuntResults = this.treasureHuntReportService.calculateTreasureHuntResults(this.treasureHunt, this.settings);
    });
  }

  ngOnDestroy() {
    this.getResultsSubscription.unsubscribe();
  }

}
