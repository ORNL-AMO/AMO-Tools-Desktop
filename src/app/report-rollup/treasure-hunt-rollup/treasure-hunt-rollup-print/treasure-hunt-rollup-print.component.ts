import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { OpportunitiesPaybackDetails, TreasureHuntResults } from '../../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../../../treasure-hunt/treasure-chest/opportunity-cards/opportunity-cards.service';

@Component({
    selector: 'app-treasure-hunt-rollup-print',
    templateUrl: './treasure-hunt-rollup-print.component.html',
    styleUrls: ['./treasure-hunt-rollup-print.component.css'],
    standalone: false
})
export class TreasureHuntRollupPrintComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  combinedTreasureHuntResults: TreasureHuntResults;
  @Input()
  allOpportunityCardsData: Array<OpportunityCardData>;
  @Input()
  opportunitiesPaybackDetails: OpportunitiesPaybackDetails;
  @Input()
  allTeamsData: Array<{ team: string, costSavings: number, implementationCost: number, paybackPeriod: number }>;
  constructor() { }

  ngOnInit(): void {
  }

}
