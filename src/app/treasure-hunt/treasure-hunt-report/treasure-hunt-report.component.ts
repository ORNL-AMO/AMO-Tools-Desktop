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

  present() {
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
      background: { color: "2E4053" },
      margin: 0.0
    });
    let slide1 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    //slide1.background = { color: '2E4053' };
    let textboxText = facilityInfo.facilityName + " Treasure Hunt Report";
    let textboxOpts: pptxgen.TextPropsOptions = { w: '100%', h: '100%', align: 'center', bold: true, color: 'FFFFFF', fontSize: 88, valign: 'middle', isTextBox: true };
    slide1.addText(textboxText, textboxOpts);
    this.presenting.executiveSummary = true;
    this.cd.detectChanges();
    //slide 2    
    pptx.tableToSlides("costSum", { masterSlideName: "MASTER_SLIDE", autoPage: true , addHeaderToEach: true, autoPageCharWeight: -1.0, autoPageLineWeight: -1.0, slideMargin: 0.0 });
    
    //slide 3 Cost Summary Bar chart
    let chartData: { projectedCosts: Array<number>, labels: Array<string>, costSavings: Array<number> } = this.getChartData();
    let costSumBarData = [
      {
        name: "Baseline",
        labels: chartData.labels,
        values: chartData.costSavings
      },
      {
        name: "Modification",
        labels: chartData.labels,
        values: chartData.projectedCosts
      }

    ];
    let barChartOptions: pptxgen.IChartOpts = { 
      x: 0, 
      y: 0, 
      w: '100%', 
      h: '100%', 
      altText: 'Cost Summary Bar chart', 
      title: 'Cost Summary Bar chart', 
      titleAlign: 'center', 
      titleColor: 'FFFFFF', 
      titleFontSize: 18, 
      titlePos: { x:0, y:1}, 
      showLabel: true, 
      showTitle: true, 
      showValue: true, 
      showLegend: true, 
      barDir: 'col', 
      barGrouping: 'stacked',
      dataLabelFormatCode: '$#,##0',
      dataLabelPosition: 't',
      chartColors: ['1E7640', '2ABDDA', '84B641', '7030A0'],
      legendFontSize: 16,
      legendColor: 'FFFFFF',
      dataLabelColor: 'FFFFFF',
      catAxisLabelColor: 'FFFFFF',
      valAxisLabelColor: 'FFFFFF',
      dataLabelFontSize: 16,
      catAxisLabelFontSize: 16
    };

    let slide3 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide3.addChart("bar", costSumBarData, barChartOptions);
    
    
    
    
    //slide 4
    pptx.tableToSlides("detailedSum", { masterSlideName: "MASTER_SLIDE", autoPage: true, addHeaderToEach: true, autoPageCharWeight: -1.0, autoPageLineWeight: -1.0, slideMargin: 0.0 });
    //slide 5
    pptx.tableToSlides("carbonResults", { masterSlideName: "MASTER_SLIDE", autoPage: true, addHeaderToEach: true, autoPageCharWeight: -1.0, autoPageLineWeight: -1.0, slideMargin: 0.0 });
    //slide 6
    pptx.tableToSlides("teamSummaryTable", { masterSlideName: "MASTER_SLIDE", autoPage: true, addHeaderToEach: true, autoPageCharWeight: -1.0, autoPageLineWeight: -1.0, slideMargin: 0.0 });
   
    
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
    let slide7 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    let chartOptions: pptxgen.IChartOpts = { 
      x: 0,
      y: 0, 
      w: '100%', 
      h: '100%', 
      altText: 'Team Summary', 
      title: 'Team Summary', 
      titleAlign: 'center', 
      titleColor: 'FFFFFF', 
      titleFontSize: 18, 
      titlePos: { x:0, y:1}, 
      showLabel: true, 
      showTitle: true, 
      showValue: true,
      showPercent: false,
      dataLabelFormatCode: '$#,##0',
      chartColors: ['1E7640', '2ABDDA', '84B641', '7030A0'],
      dataLabelPosition: 'ctr',
      dataLabelFontSize: 16
    };
    slide7.addChart("pie", data, chartOptions);

    //slide 8
    pptx.tableToSlides("paybackTable", { masterSlideName: "MASTER_SLIDE", autoPage: true, addHeaderToEach: true, autoPageCharWeight: -1.0, autoPageLineWeight: -1.0, slideMargin: 0.0 });
   
    let slide9 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    let paybackBarData = this.getPaybackBarData();
    slide9.addChart("bar", paybackBarData, barChartOptions);
   


    this.presenting.executiveSummary = false;
    this.cd.detectChanges();
    pptx.writeFile();

  }

  getChartData(): { projectedCosts: Array<number>, labels: Array<string>, costSavings: Array<number> } {
    let labels = new Array<string>();
    let projectedCosts = new Array<number>();
    let costSavings = new Array<number>();
    /*
      Electricity
      Natural Gas
      Other Fuel
      Water
      Wastewater
      Steam
      Compressed Air
    */
    if (this.treasureHuntResults.electricity.costSavings > 0) {
      labels.push('Electricity');
      projectedCosts.push(this.treasureHuntResults.electricity.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.electricity.costSavings);
      // data.push([this.treasureHuntResults.electricity.modifiedEnergyCost, this.treasureHuntResults.electricity.costSavings]);
    }
    if (this.treasureHuntResults.naturalGas.costSavings > 0) {
      labels.push('Natural Gas');
      projectedCosts.push(this.treasureHuntResults.naturalGas.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.naturalGas.costSavings);
      // data.push([this.treasureHuntResults.naturalGas.modifiedEnergyCost, this.treasureHuntResults.naturalGas.costSavings]);
    }
    if (this.treasureHuntResults.otherFuel.costSavings > 0) {
      labels.push('Other Fuel');
      projectedCosts.push(this.treasureHuntResults.otherFuel.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.otherFuel.costSavings);
      // data.push([this.treasureHuntResults.otherFuel.modifiedEnergyCost, this.treasureHuntResults.otherFuel.costSavings]);
    }
    if (this.treasureHuntResults.water.costSavings > 0) {
      labels.push('Water');
      projectedCosts.push(this.treasureHuntResults.water.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.water.costSavings);
      // data.push([this.treasureHuntResults.water.modifiedEnergyCost, this.treasureHuntResults.water.costSavings]);
    }
    if (this.treasureHuntResults.wasteWater.costSavings > 0) {
      labels.push('Wastewater');
      projectedCosts.push(this.treasureHuntResults.wasteWater.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.wasteWater.costSavings);
      // data.push([this.treasureHuntResults.wasteWater.modifiedEnergyCost, this.treasureHuntResults.wasteWater.costSavings]);
    }
    if (this.treasureHuntResults.steam.costSavings > 0) {
      labels.push('Steam');
      projectedCosts.push(this.treasureHuntResults.steam.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.steam.costSavings);
      // data.push([this.treasureHuntResults.steam.modifiedEnergyCost, this.treasureHuntResults.steam.costSavings]);
    }
    if (this.treasureHuntResults.compressedAir.costSavings > 0) {
      labels.push('Comp. Air');
      projectedCosts.push(this.treasureHuntResults.compressedAir.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.compressedAir.costSavings);
      // data.push([this.treasureHuntResults.compressedAir.modifiedEnergyCost, this.treasureHuntResults.compressedAir.costSavings > 0 ? this.treasureHuntResults.compressedAir.costSavings : 0]);
    }
    return { projectedCosts: projectedCosts, labels: labels, costSavings: costSavings };
  }

  getPaybackBarData() {
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

}
