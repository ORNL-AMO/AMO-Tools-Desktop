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
import { PresentReport } from './treasure-hunt-report.service';
import pptxgen from 'pptxgenjs';
import * as _ from 'lodash';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import * as betterPlantsPPTimg from './better-plants-ppt-img.js';
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
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

  presenting: PresentReport = {
    executiveSummary: false,
    opportunitySummary: false,
    paybackDetails: false,
    reportGraphs: false,
    facilityInfo: false
  };
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
    private settingsDbService: SettingsDbService) { }

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
    this.presenting.executiveSummary = true;
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

    let tableToSlidesOpt: pptxgen.TableToSlidesProps = this.getTableToSlideProperties();   
    let slideTitleOps: pptxgen.TextPropsOptions = this.getSlideTitleProperties();    
    let barChartOptions: pptxgen.IChartOpts = this.getBarChartProperties();
    let pieChartOptions: pptxgen.IChartOpts = this.getPieChartProperties();
    let costSumBarData: { name: string, labels: Array<string>, values: Array<number> }[] = this.getCostSummaryData();    
    let teamSummaryData: { name: string, labels: Array<string>, values: Array<number> }[] = this.getTeamSummaryData();
    let paybackBarData: { name: string, labels: Array<string>, values: Array<number> }[] = this.getPaybackData();    
    
    let slide1 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide1.addText(facilityInfo.facilityName + " Treasure Hunt Report", { w: '100%', h: '100%', align: 'center', bold: true, color: '2E4053', fontSize: 88, valign: 'middle', isTextBox: true });
    
    pptx.tableToSlides("costSum", tableToSlidesOpt);

    let slide3 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide3.addChart("bar", costSumBarData, barChartOptions);
    slide3.addText('Cost Summary', slideTitleOps);

    pptx.tableToSlides("detailedSum", tableToSlidesOpt);

    pptx.tableToSlides("carbonResults", tableToSlidesOpt);

    pptx.tableToSlides("teamSummaryTable", tableToSlidesOpt);

    let slide7 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide7.addChart("pie", teamSummaryData, pieChartOptions);
    slide7.addText('Team Summary', slideTitleOps);

    pptx.tableToSlides("paybackTable", tableToSlidesOpt);

    let slide9 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide9.addChart("bar", paybackBarData, barChartOptions);
    slide9.addText('Payback Details', slideTitleOps);

    let slide10 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide10.addChart("pie", paybackBarData, pieChartOptions);
    slide10.addText('Payback Details', slideTitleOps);

    this.presenting.executiveSummary = false;
    this.cd.detectChanges();
    pptx.writeFile({ fileName: this.fileName + '.pptx' });
    this.hideExportModal();
  }

  getSlideTitleProperties(): pptxgen.TextPropsOptions{
    let slideTitleOps: pptxgen.TextPropsOptions = { 
      w: '100%', 
      align: 'center', 
      bold: true, 
      color: 'FFFFFF', 
      fontSize: 60, 
      valign: 'top', 
      isTextBox: true 
    };
    return slideTitleOps;
  }

  getTableToSlideProperties(): pptxgen.TableToSlidesProps{
    let tableToSlidesOpt: pptxgen.TableToSlidesProps = { 
      y: 1.2, 
      masterSlideName: "MASTER_SLIDE", 
      autoPage: true, 
      addHeaderToEach: true, 
      autoPageCharWeight: -1.0, 
      autoPageLineWeight: -1.0, 
      slideMargin: 0.0 
    };
    return tableToSlidesOpt;
  }

  getCostSummaryData(): { name: string, labels: Array<string>, values: Array<number> }[] {
    let labels = new Array<string>();
    let projectedCosts = new Array<number>();
    let costSavings = new Array<number>();
    if (this.treasureHuntResults.electricity.costSavings > 0) {
      labels.push('Electricity');
      projectedCosts.push(this.treasureHuntResults.electricity.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.electricity.costSavings);
    }
    if (this.treasureHuntResults.naturalGas.costSavings > 0) {
      labels.push('Natural Gas');
      projectedCosts.push(this.treasureHuntResults.naturalGas.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.naturalGas.costSavings);
    }
    if (this.treasureHuntResults.otherFuel.costSavings > 0) {
      labels.push('Other Fuel');
      projectedCosts.push(this.treasureHuntResults.otherFuel.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.otherFuel.costSavings);
    }
    if (this.treasureHuntResults.water.costSavings > 0) {
      labels.push('Water');
      projectedCosts.push(this.treasureHuntResults.water.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.water.costSavings);
    }
    if (this.treasureHuntResults.wasteWater.costSavings > 0) {
      labels.push('Wastewater');
      projectedCosts.push(this.treasureHuntResults.wasteWater.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.wasteWater.costSavings);
    }
    if (this.treasureHuntResults.steam.costSavings > 0) {
      labels.push('Steam');
      projectedCosts.push(this.treasureHuntResults.steam.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.steam.costSavings);
    }
    if (this.treasureHuntResults.compressedAir.costSavings > 0) {
      labels.push('Comp. Air');
      projectedCosts.push(this.treasureHuntResults.compressedAir.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.compressedAir.costSavings);
    }
    let costSumBarData = [{ name: "Modification", labels: labels, values: projectedCosts }, { name: "Baseline", labels: labels, values: costSavings }];
    return costSumBarData;
  }

  getPaybackData(): { name: string, labels: Array<string>, values: Array<number> }[] {
    let values: Array<number> = new Array();
    let labels: Array<string> = new Array();
    values = [
      this.opportunitiesPaybackDetails.lessThanOneYear.totalSavings,
      this.opportunitiesPaybackDetails.oneToTwoYears.totalSavings,
      this.opportunitiesPaybackDetails.twoToThreeYears.totalSavings,
      this.opportunitiesPaybackDetails.moreThanThreeYears.totalSavings
    ];
    labels = [
      "Less than 1 Year (" + this.settings.currency + ")",
      "1 to 2 Years (" + this.settings.currency + ")",
      "2 to 3 Years (" + this.settings.currency + ")",
      "More than 3 Years (" + this.settings.currency + ")"
    ];
    let data = [{
      name: "Opportunity Payback Details",
      labels: labels,
      values: values
    }];
    return data;
  }

  getTeamSummaryData(): { name: string, labels: Array<string>, values: Array<number> }[] {
    let teamData = this.treasureHuntReportService.getTeamData(this.opportunityCardsData);
    teamData = _.orderBy(teamData, 'costSavings', 'desc');
    let values: Array<number> = new Array();
    let labels: Array<string> = new Array();
    teamData.forEach(team => {
      values.push(team.costSavings);
      labels.push(team.team);
    });
    let data = [{
      name: "Team Summary",
      labels: labels,
      values: values
    }];
    return data;
  }

  getPieChartProperties() {
    let pieChartOptions: pptxgen.IChartOpts = {
      x: 1.6,
      y: 1.2,
      w: '76%',
      h: '76%',
      showPercent: false,
      showValue: true,
      dataLabelFormatCode: '$#,##0',
      chartColors: ['1E7640', '2ABDDA', '84B641', 'BC8FDD'],
      dataLabelPosition: 'bestFit',
      dataLabelFontSize: 18,
      dataLabelColor: '000000',
      dataLabelFontBold: true,
      showLegend: true,
      legendFontSize: 16,
      legendColor: '2E4053',
      firstSliceAng: 90
    };
    return pieChartOptions;
  }

  getBarChartProperties() {
    let barChartOptions: pptxgen.IChartOpts = {
      x: 1.6,
      y: 1.2,
      w: '76%',
      h: '76%',
      showLegend: true,
      showValue: true,
      barDir: 'col',
      barGrouping: 'stacked',
      dataLabelFormatCode: '$#,##0',
      dataLabelPosition: 'bestFit',
      chartColors: ['1E7640', '2ABDDA', '84B641', 'BC8FDD'],
      legendFontSize: 16,
      legendColor: '2E4053',
      dataLabelColor: '000000',
      dataLabelFontBold: true,
      catAxisLabelColor: '2E4053',
      valAxisLabelColor: '2E4053',
      dataLabelFontSize: 18,
      catAxisLabelFontSize: 16
    };
    return barChartOptions;
  }

}
