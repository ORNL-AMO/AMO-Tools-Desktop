import { Component, OnInit, Input, ElementRef, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { TreasureHuntResults } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import * as _ from 'lodash';
import { OpportunityCardData } from '../../treasure-chest/opportunity-cards/opportunity-cards.service';
import { TreasureChestMenuService } from '../../treasure-chest/treasure-chest-menu/treasure-chest-menu.service';
import { TreasureHuntReportService } from '../treasure-hunt-report.service';

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
  showPrintView: boolean;
  @Input()
  opportunityCardsData: Array<OpportunityCardData>;

  teamData: Array<{ team: string, costSavings: number, implementationCost: number, paybackPeriod: number }>;
  constructor(private treasureChestMenuService: TreasureChestMenuService, private treasureHuntReportService: TreasureHuntReportService) { }

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