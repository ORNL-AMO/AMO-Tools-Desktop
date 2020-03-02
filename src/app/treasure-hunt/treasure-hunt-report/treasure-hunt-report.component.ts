import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { Directory } from '../../shared/models/directory';
import { TreasureHuntResults, OpportunitiesPaybackDetails, OpportunitySummary, TreasureHunt } from '../../shared/models/treasure-hunt';
import { TreasureHuntReportService } from './treasure-hunt-report.service';
import { OpportunityPaybackService } from './opportunity-payback.service';
import { Subscription } from 'rxjs';
import { OpportunityCardsService, OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';
import { TreasureChestMenuService } from '../treasure-chest/treasure-chest-menu/treasure-chest-menu.service';
import { SortCardsService } from '../treasure-chest/opportunity-cards/sort-cards.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { PrintOptionsMenuService } from '../../shared/print-options-menu/print-options-menu.service';
import { PrintOptions } from '../../shared/models/printing';
@Component({
  selector: 'app-treasure-hunt-report',
  templateUrl: './treasure-hunt-report.component.html',
  styleUrls: ['./treasure-hunt-report.component.css']
})
export class TreasureHuntReportComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  settings: Settings;
  @Input()
  directory: Directory;
  @Input()
  containerHeight: number;
  @Input()
  inRollup: boolean = false;

  @ViewChild('reportBtns', { static: false }) reportBtns: ElementRef;
  @ViewChild('reportHeader', { static: false }) reportHeader: ElementRef;
  reportContainerHeight: number;

  //print logic
  showPrintView: boolean = false;
  showPrintViewSub: Subscription;
  showPrintMenu: boolean = false;
  showPrintMenuSub: Subscription;
  showPrintDiv: boolean = false;
  selectAll: boolean = false;

  currentTab: string = 'executiveSummary';
  assessmentDirectories: Array<Directory> = [];
  dataCalculated: boolean = true;
  treasureHuntResults: TreasureHuntResults;
  opportunityCardsData: Array<OpportunityCardData>;
  opportunitiesPaybackDetails: OpportunitiesPaybackDetails;
  showPrintSub: Subscription;
  sortBySub: Subscription;
  printOptions: PrintOptions;
  constructor(private printOptionsMenuService: PrintOptionsMenuService, private treasureHuntReportService: TreasureHuntReportService,
    private opportunityPaybackService: OpportunityPaybackService,
    private opportunityCardsService: OpportunityCardsService, private treasureChestMenuService: TreasureChestMenuService,
    private sortCardsService: SortCardsService, private directoryDbService: DirectoryDbService) { }

  ngOnInit() {
    if (this.assessment) {
      this.getDirectoryList(this.assessment.directoryId);
    }
    if (!this.inRollup) {
      this.sortBySub = this.treasureChestMenuService.sortBy.subscribe(val => {
        if (this.assessment.treasureHunt.setupDone == true) {
          let filteredTreasureHunt: TreasureHunt = this.sortCardsService.sortTreasureHunt(this.assessment.treasureHunt, val, this.settings);
          this.treasureHuntResults = this.treasureHuntReportService.calculateTreasureHuntResults(filteredTreasureHunt, this.settings);
          this.opportunityCardsData = this.opportunityCardsService.getOpportunityCardsData(filteredTreasureHunt, this.settings);
          let oppCards = this.opportunityCardsService.opportunityCards.getValue();
          if (oppCards.length != this.opportunityCardsData.length) {
            this.opportunityCardsService.opportunityCards.next(this.opportunityCardsData);
          }
          this.opportunitiesPaybackDetails = this.opportunityPaybackService.getOpportunityPaybackDetails(this.treasureHuntResults.opportunitySummaries);
        }
      });
    } else {
      this.treasureHuntResults = this.treasureHuntReportService.calculateTreasureHuntResults(this.assessment.treasureHunt, this.settings);
      this.opportunityCardsData = this.opportunityCardsService.getOpportunityCardsData(this.assessment.treasureHunt, this.settings);
      this.opportunitiesPaybackDetails = this.opportunityPaybackService.getOpportunityPaybackDetails(this.treasureHuntResults.opportunitySummaries);
    }

    if (this.inRollup) {
      this.setTab('opportunitySummary');
    }
    if (!this.inRollup) {
      this.showPrintMenuSub = this.printOptionsMenuService.showPrintMenu.subscribe(val => {
        this.showPrintMenu = val;
      });
    }

    this.showPrintViewSub = this.printOptionsMenuService.showPrintView.subscribe(val => {
      this.printOptions = this.printOptionsMenuService.printOptions.getValue();
      this.showPrintDiv = val;
      if (val == true) {
        //use delay to show loading before print payload starts
        setTimeout(() => {
          this.showPrintView = val;
        }, 20)
      } else {
        this.showPrintView = val;
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.containerHeight && !changes.containerHeight.firstChange) {
      this.getContainerHeight();
    }
  }

  ngOnDestroy() {
    if (!this.inRollup) {
      this.sortBySub.unsubscribe();
    }
    if (this.showPrintMenuSub) {
      this.showPrintMenuSub.unsubscribe();
    }
    this.showPrintViewSub.unsubscribe();
  }

  getContainerHeight() {
    let btnHeight: number = this.reportBtns.nativeElement.clientHeight;
    let headerHeight: number = this.reportHeader.nativeElement.clientHeight;
    this.reportContainerHeight = this.containerHeight - btnHeight - headerHeight - 25;
  }

  setTab(str: string) {
    this.currentTab = str;
  }

  getDirectoryList(id: number) {
    if (id && id !== 1) {
      let results = this.directoryDbService.getById(id);
      this.assessmentDirectories.push(results);
      if (results.parentDirectoryId !== 1) {
        this.getDirectoryList(results.parentDirectoryId);
      }
    }
  }

  updateResults(opportunitySummaries: Array<OpportunitySummary>) {
    this.treasureHuntResults = this.treasureHuntReportService.calculateTreasureHuntResultsFromSummaries(opportunitySummaries, this.assessment.treasureHunt.currentEnergyUsage);
    this.opportunityCardsData = this.opportunityCardsService.getOpportunityCardsData(this.assessment.treasureHunt, this.settings);
    this.opportunitiesPaybackDetails = this.opportunityPaybackService.getOpportunityPaybackDetails(this.treasureHuntResults.opportunitySummaries);
  }

  print() {
    this.printOptionsMenuService.printContext.next('treasureHunt');
    this.printOptionsMenuService.showPrintMenu.next(true);
  }

}
