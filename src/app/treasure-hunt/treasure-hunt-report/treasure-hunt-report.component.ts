import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { Directory } from '../../shared/models/directory';
import { TreasureHuntResults, OpportunitiesPaybackDetails, OpportunitySummary } from '../../shared/models/treasure-hunt';
import { TreasureHuntReportService } from './treasure-hunt-report.service';
import { OpportunityPaybackService } from './opportunity-payback.service';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { Subscription } from 'rxjs';
import { OpportunityCardsService, OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';
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
  @Input()
  printView: boolean;
  @Input()
  printReportGraphs: boolean;
  @Input()
  printExecutiveSummary: boolean;
  @Input()
  printReportOpportunityPayback: boolean;
  @Input()
  printReportOpportunitySummary: boolean;

  @ViewChild('reportBtns', { static: false }) reportBtns: ElementRef;
  @ViewChild('reportHeader', { static: false }) reportHeader: ElementRef;
  reportContainerHeight: number;

  //print logic
  showPrint: boolean = false;
  showPrintMenu: boolean = false;
  showPrintDiv: boolean = false;
  selectAll: boolean = false;

  currentTab: string = 'executiveSummary';
  assessmentDirectories: Array<Directory> = [];
  dataCalculated: boolean = true;
  treasureHuntResults: TreasureHuntResults;
  opportunityCardsData: Array<OpportunityCardData>;
  opportunitiesPaybackDetails: OpportunitiesPaybackDetails;
  showPrintSub: Subscription;
  constructor(private treasureHuntReportService: TreasureHuntReportService,
    private opportunityPaybackService: OpportunityPaybackService, private windowRefService: WindowRefService,
    private opportunityCardsService: OpportunityCardsService) { }

  ngOnInit() {
    if (this.assessment) {
      this.getDirectoryList(this.assessment.id);
    }
    if (this.assessment.treasureHunt.setupDone == true) {
      this.treasureHuntResults = this.treasureHuntReportService.calculateTreasureHuntResults(this.assessment.treasureHunt, this.settings);
      this.opportunityCardsData = this.opportunityCardsService.getOpportunityCardsData(this.assessment.treasureHunt, this.settings);
      this.opportunitiesPaybackDetails = this.opportunityPaybackService.getOpportunityPaybackDetails(this.treasureHuntResults.opportunitySummaries);
    }

    if (this.inRollup) {
      this.setTab('opportunitySummary');
    }

    //subscribe to print event
    this.showPrintSub = this.treasureHuntReportService.showPrint.subscribe(printVal => {
      //shows loading print view
      this.showPrintDiv = printVal;
      if (printVal == true) {
        //use delay to show loading before print payload starts
        setTimeout(() => {
          this.showPrint = printVal;
        }, 20)
      } else {
        this.showPrint = printVal;
      }
    });

    if (this.printView !== undefined) {
      if (this.printView) {
        this.showPrint = true;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.containerHeight && !changes.containerHeight.firstChange) {
      this.getContainerHeight();
    }
    if (changes.printViewSelection && !changes.printViewSelection.firstChange) {
      this.initPrintLogic();
    }
  }

  ngOnDestroy() {
    this.showPrintSub.unsubscribe();
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
    // if (id && id !== 1) {
    //   let results = this.directoryDbService.getById(id);
    //   this.assessmentDirectories.push(results);
    //   if (results.parentDirectoryId !== 1) {
    //     this.getDirectoryList(results.parentDirectoryId);
    //   }
    // }
  }

  updateResults(opportunitySummaries: Array<OpportunitySummary>) {
    this.treasureHuntResults = this.treasureHuntReportService.calculateTreasureHuntResultsFromSummaries(opportunitySummaries, this.assessment.treasureHunt.currentEnergyUsage);
    this.opportunityCardsData = this.opportunityCardsService.getOpportunityCardsData(this.assessment.treasureHunt, this.settings);
    this.opportunitiesPaybackDetails = this.opportunityPaybackService.getOpportunityPaybackDetails(this.treasureHuntResults.opportunitySummaries);
  }


  initPrintLogic() {
    if (!this.inRollup) {
      this.printReportGraphs = false;
      this.printReportOpportunitySummary = false;
      this.printReportOpportunityPayback = false;
      this.printExecutiveSummary = false;
    }
  }

  showModal(): void {
    this.showPrintMenu = true;
  }

  closeModal(reset: boolean): void {
    if (reset) {
      this.resetPrintSelection();
    }
    this.showPrintMenu = false;
  }

  resetPrintSelection() {
    this.selectAll = false;
    this.printReportGraphs = false;
    this.printReportOpportunitySummary = false;
    this.printReportOpportunityPayback = false;
    this.printExecutiveSummary = false;
  }

  togglePrint(section: string): void {
    switch (section) {
      case "selectAll": {
        this.selectAll = !this.selectAll;
        if (this.selectAll) {
          this.printReportGraphs = true;
          this.printReportOpportunitySummary = true;
          this.printReportOpportunityPayback = true;
          this.printExecutiveSummary = true;
        }
        else {
          this.printReportGraphs = false;
          this.printReportOpportunitySummary = false;
          this.printReportOpportunityPayback = false;
          this.printExecutiveSummary = false;
        }
        break;
      }
      case "reportGraphs": {
        this.printReportGraphs = !this.printReportGraphs;
        break;
      }
      case "opportunitySummary": {
        this.printReportOpportunitySummary = !this.printReportOpportunitySummary;
        break;
      }
      case "opportunityPayback": {
        this.printReportOpportunityPayback = !this.printReportOpportunityPayback;
        break;
      }
      case "executiveSummary": {
        this.printExecutiveSummary = !this.printExecutiveSummary;
        break;
      }
      default: {
        break;
      }
    }
  }

  print(): void {
    this.closeModal(false);
    //when print clicked set show print value to true
    this.treasureHuntReportService.showPrint.next(true);
    setTimeout(() => {
      let win = this.windowRefService.nativeWindow;
      win.print();
      //after printing hide content again
      this.treasureHuntReportService.showPrint.next(false);
      this.resetPrintSelection();
    }, 2000);
  }
}
