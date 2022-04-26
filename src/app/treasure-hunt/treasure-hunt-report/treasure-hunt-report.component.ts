import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FacilityInfo, Settings } from '../../shared/models/settings';
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
import { TreasureHuntResultsData } from '../../report-rollup/report-rollup-models';
import { TreasureHuntReportRollupService } from '../../report-rollup/treasure-hunt-report-rollup.service';
import { TreasureHuntService } from '../treasure-hunt.service';
import { ExecutiveSummaryComponent } from './executive-summary/executive-summary.component';
import pptxgen from 'pptxgenjs';
import * as _ from 'lodash';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import * as betterPlantsPPTimg from './better-plants-ppt-img.js';
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
import { PptxgenjsChartData, TreasureHuntPptService } from './treasure-hunt-ppt.service';
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

  @ViewChild('executiveSummaryTable', { static: false }) executiveSummary: ExecutiveSummaryComponent;
  @ViewChild('exportModal', { static: false }) public exportModal: ModalDirective;

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

  presenting: boolean;
  fileName: string;

  currentTab: string = 'executiveSummary';
  assessmentDirectories: Array<Directory> = [];
  dataCalculated: boolean = true;
  treasureHuntResults: TreasureHuntResults;
  opportunityCardsData: Array<OpportunityCardData>;
  opportunitiesPaybackDetails: OpportunitiesPaybackDetails;
  showPrintSub: Subscription;
  sortBySub: Subscription;
  printOptions: PrintOptions;
  allTreasureHuntResultsSub: Subscription;
  constructor(private printOptionsMenuService: PrintOptionsMenuService, private treasureHuntReportService: TreasureHuntReportService,
    private opportunityPaybackService: OpportunityPaybackService,
    private opportunityCardsService: OpportunityCardsService, private treasureChestMenuService: TreasureChestMenuService,
    private sortCardsService: SortCardsService, private directoryDbService: DirectoryDbService, private cd: ChangeDetectorRef,
    private treasureHuntReportRollupService: TreasureHuntReportRollupService, private treasureHuntService: TreasureHuntService,
    private settingsDbService: SettingsDbService, private treasureHuntPPTService: TreasureHuntPptService) { }

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
      this.showPrintMenuSub = this.printOptionsMenuService.showPrintMenu.subscribe(val => {
        this.showPrintMenu = val;
      });
    } else {
      this.setTab('opportunitySummary');
      this.allTreasureHuntResultsSub = this.treasureHuntReportRollupService.allTreasureHuntResults.subscribe(allResults => {
        let assessmentResult: TreasureHuntResultsData = allResults.find(result => { return result.assessment.id == this.assessment.id });
        this.treasureHuntResults = assessmentResult.treasureHuntResults;
        this.opportunityCardsData = assessmentResult.opportunityCardsData;
        this.opportunitiesPaybackDetails = assessmentResult.opportunitiesPaybackDetails;
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

  ngAfterViewInit() {
    this.getContainerHeight();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.containerHeight && !changes.containerHeight.firstChange) {
      this.getContainerHeight();
    }
  }

  ngOnDestroy() {
    if (this.sortBySub) {
      this.sortBySub.unsubscribe();
    }
    if (this.allTreasureHuntResultsSub) {
      this.allTreasureHuntResultsSub.unsubscribe();
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
    this.cd.detectChanges();
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
    if (!this.inRollup) {
      this.treasureHuntResults = this.treasureHuntReportService.calculateTreasureHuntResultsFromSummaries(opportunitySummaries, this.assessment.treasureHunt.currentEnergyUsage, this.settings);
      this.opportunityCardsData = this.opportunityCardsService.getOpportunityCardsData(this.assessment.treasureHunt, this.settings);
      this.opportunitiesPaybackDetails = this.opportunityPaybackService.getOpportunityPaybackDetails(this.treasureHuntResults.opportunitySummaries);
    } else {
      let treasureHuntResults = this.treasureHuntReportService.calculateTreasureHuntResultsFromSummaries(opportunitySummaries, this.assessment.treasureHunt.currentEnergyUsage, this.settings);
      let opportunityCardsData = this.opportunityCardsService.getOpportunityCardsData(this.assessment.treasureHunt, this.settings);
      let opportunitiesPaybackDetails = this.opportunityPaybackService.getOpportunityPaybackDetails(this.treasureHuntResults.opportunitySummaries);
      this.treasureHuntReportRollupService.updateTreasureHuntResults(treasureHuntResults, opportunityCardsData, opportunitiesPaybackDetails, this.assessment.id);
    }
  }

  print() {
    this.printOptionsMenuService.printContext.next('treasureHunt');
    this.printOptionsMenuService.showPrintMenu.next(true);
  }

  showExportModal() {
    this.fileName = this.getFileName();
    this.exportModal.show();
  }

  hideExportModal() {
    this.exportModal.hide();
  }

  getFileName(): string {
    const date: Date = new Date();
    let formatedDate: string = moment(date).format("MMM D, YYYY").toString();
    return formatedDate + ' - Treasure Hunt Report.ppt';
  }

  present() {
    this.presenting = true;
    this.cd.detectChanges();
    if (!this.fileName) {
      this.fileName = this.getFileName();
    }
    let facilityInfo: FacilityInfo;
    let settings = this.settingsDbService.getByDirectoryId(this.assessment.directoryId);
    if (settings) {
      if (settings.facilityInfo) {
        facilityInfo = settings.facilityInfo;
      }
    }
    let pptx = new pptxgen();
    pptx.layout = "LAYOUT_WIDE";
    pptx.defineSlideMaster({
      title: "MASTER_SLIDE",
      background: { data: betterPlantsPPTimg.logoBase64 },
      margin: 0.0
    });

    let tableToSlidesProperties: pptxgen.TableToSlidesProps = this.treasureHuntPPTService.getTableToSlideProperties();
    let slideTitleProperties: pptxgen.TextPropsOptions = this.treasureHuntPPTService.getSlideTitleProperties();
    let barChartOptions: pptxgen.IChartOpts = this.treasureHuntPPTService.getBarChartProperties();
    let pieChartOptions: pptxgen.IChartOpts = this.treasureHuntPPTService.getPieChartProperties();
    let costSumBarData: PptxgenjsChartData[] = this.treasureHuntPPTService.getCostSummaryData(this.treasureHuntResults);
    let teamSummaryData: PptxgenjsChartData[] = this.treasureHuntPPTService.getTeamSummaryData(this.opportunityCardsData);
    let paybackBarData: PptxgenjsChartData[] = this.treasureHuntPPTService.getPaybackData(this.opportunitiesPaybackDetails, settings);

    let slide1 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    let titleSlideName: string;
    if (!facilityInfo.facilityName) {
      titleSlideName = "Treasure Hunt Report";
    } else {
      titleSlideName = facilityInfo.facilityName + " Treasure Hunt Report";
    }
    slide1.addText(titleSlideName, { w: '100%', h: '100%', align: 'center', bold: true, color: '1D428A', fontSize: 88, fontFace: 'Arial (Headings)', valign: 'middle', isTextBox: true });

    pptx.tableToSlides("costSum", tableToSlidesProperties);

    let slide3 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide3.addChart("bar", costSumBarData, barChartOptions);
    slide3.addText('Cost Summary', slideTitleProperties);

    pptx.tableToSlides("detailedSum", tableToSlidesProperties);

    pptx.tableToSlides("carbonResults", tableToSlidesProperties);

    pptx.tableToSlides("teamSummaryTable", tableToSlidesProperties);

    let slide7 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide7.addChart("pie", teamSummaryData, pieChartOptions);
    slide7.addText('Team Summary', slideTitleProperties);

    pptx.tableToSlides("paybackTable", tableToSlidesProperties);

    let slide9 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide9.addChart("bar", paybackBarData, barChartOptions);
    slide9.addText('Payback Details', slideTitleProperties);

    let slide10 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide10.addChart("pie", paybackBarData, pieChartOptions);
    slide10.addText('Payback Details', slideTitleProperties);

    let slide11 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide11.addText('Opportunity Summaries', { w: '100%', h: '100%', align: 'center', bold: true, color: '1D428A', fontSize: 88, fontFace: 'Arial (Headings)', valign: 'middle', isTextBox: true });

    let counter: number = 0;
    this.opportunityCardsData.forEach(opp => {
      let newSlide = pptx.addSlide({ masterName: "MASTER_SLIDE" });
      newSlide.addText('Opportunity: ' + opp.name, slideTitleProperties);
      let slideText: { text: pptxgen.TextProps[], options: pptxgen.TextPropsOptions } = this.treasureHuntPPTService.getOpportunitySlideText(opp.opportunitySheet);
      newSlide.addText(slideText.text, slideText.options);
      newSlide.addText('Placeholder for picture', { x: 8.45, y: 1.2, w: 4.43, h: 2.81, align: 'center', fill: { color: '7ADCFF' }, color: 'FFFFFF', fontSize: 18, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true });
      let rows = [];
      rows.push(["Utility", "Energy Savings", "Cost Saving", "Material Cost", "Labor Cost", "Other Cost", "Total Cost", "Simple Payback"]);
      let x: OpportunitySummary = this.treasureHuntResults.opportunitySummaries[counter];
      rows.push([x.utilityType, x.totalEnergySavings, x.costSavings, x.opportunityCost.material, x.opportunityCost.labor, x.opportunityCost.otherCosts, x.totalCost, x.payback]);
      newSlide.addTable(rows, { x: 1.19, y: 5.26, w: 10.95, color: "1D428A", fontSize: 16, fontFace: 'Arial (Body)'  });
      counter++;
    });

    this.presenting = false;
    this.cd.detectChanges();
    pptx.writeFile({ fileName: this.fileName + '.pptx' });
    this.hideExportModal();
  }


}
