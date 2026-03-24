import { Component, OnInit, Input, inject, Signal } from '@angular/core';
import { TreasureHuntResults } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import * as _ from 'lodash';
import { OpportunityCardData } from '../../treasure-chest/opportunity-cards/opportunity-cards.service';
import { TreasureHuntReportService } from '../treasure-hunt-report.service';
import { FeatureFlagService } from '../../../shared/feature-flag.service';

@Component({
    selector: 'app-executive-summary',
    templateUrl: './executive-summary.component.html',
    styleUrls: ['./executive-summary.component.css'],
    standalone: false
})
export class ExecutiveSummaryComponent implements OnInit {
  private featureFlagService = inject(FeatureFlagService);
  showOperationalImpacts: Signal<boolean> = this.featureFlagService.showOperationalImpacts;

  @Input()
  treasureHuntResults: TreasureHuntResults;
  @Input()
  settings: Settings;
  @Input()
  showPrintView: boolean;
  @Input()
  opportunityCardsData: Array<OpportunityCardData>;

  teamData: Array<{ team: string, costSavings: number, implementationCost: number, paybackPeriod: number }>;
  constructor(private treasureHuntReportService: TreasureHuntReportService) { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.opportunityCardsData) {
      this.setTeamData();
    }
  }

  setTeamData(){
    this.teamData = this.treasureHuntReportService.getTeamData(this.opportunityCardsData);
  }
}