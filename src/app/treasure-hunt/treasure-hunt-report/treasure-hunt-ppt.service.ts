import { Injectable } from '@angular/core';
import { FacilityInfo, Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { Directory } from '../../shared/models/directory';
import { TreasureHuntResults, OpportunitiesPaybackDetails, OpportunitySummary, TreasureHunt, OpportunitySheet, OpportunityCost } from '../../shared/models/treasure-hunt';
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

@Injectable()
export class TreasureHuntPptService {

  constructor(private treasureHuntReportService: TreasureHuntReportService) { }


  getSlideTitleProperties(): pptxgen.TextPropsOptions {
    let slideTitleProps: pptxgen.TextPropsOptions = {
      x: 0,
      y: 0,
      w: '100%',
      h: 1.2,
      align: 'center',
      bold: true,
      color: 'FFFFFF',
      fontSize: 32,
      fontFace: 'Arial (Headings)',
      valign: 'middle',
      isTextBox: true
    };
    return slideTitleProps;
  }


  getTableToSlideProperties(): pptxgen.TableToSlidesProps {
    let tableToSlidesProps: pptxgen.TableToSlidesProps = {
      y: 1.2,
      masterSlideName: "MASTER_SLIDE",
      autoPage: true,
      addHeaderToEach: true,
      autoPageCharWeight: -1.0,
      autoPageLineWeight: -1.0,
      slideMargin: 0.0
    };
    return tableToSlidesProps;
  }

  getCostSummaryData(treasureHuntResults: TreasureHuntResults): PptxgenjsChartData[] {
    let labels = new Array<string>();
    let projectedCosts = new Array<number>();
    let costSavings = new Array<number>();
    if (treasureHuntResults.electricity.costSavings > 0) {
      labels.push('Electricity');
      projectedCosts.push(treasureHuntResults.electricity.modifiedEnergyCost);
      costSavings.push(treasureHuntResults.electricity.costSavings);
    }
    if (treasureHuntResults.naturalGas.costSavings > 0) {
      labels.push('Natural Gas');
      projectedCosts.push(treasureHuntResults.naturalGas.modifiedEnergyCost);
      costSavings.push(treasureHuntResults.naturalGas.costSavings);
    }
    if (treasureHuntResults.otherFuel.costSavings > 0) {
      labels.push('Other Fuel');
      projectedCosts.push(treasureHuntResults.otherFuel.modifiedEnergyCost);
      costSavings.push(treasureHuntResults.otherFuel.costSavings);
    }
    if (treasureHuntResults.water.costSavings > 0) {
      labels.push('Water');
      projectedCosts.push(treasureHuntResults.water.modifiedEnergyCost);
      costSavings.push(treasureHuntResults.water.costSavings);
    }
    if (treasureHuntResults.wasteWater.costSavings > 0) {
      labels.push('Wastewater');
      projectedCosts.push(treasureHuntResults.wasteWater.modifiedEnergyCost);
      costSavings.push(treasureHuntResults.wasteWater.costSavings);
    }
    if (treasureHuntResults.steam.costSavings > 0) {
      labels.push('Steam');
      projectedCosts.push(treasureHuntResults.steam.modifiedEnergyCost);
      costSavings.push(treasureHuntResults.steam.costSavings);
    }
    if (treasureHuntResults.compressedAir.costSavings > 0) {
      labels.push('Comp. Air');
      projectedCosts.push(treasureHuntResults.compressedAir.modifiedEnergyCost);
      costSavings.push(treasureHuntResults.compressedAir.costSavings);
    }
    let costSumBarData: PptxgenjsChartData[] = [
      { name: "Modification", labels: labels, values: projectedCosts },
      { name: "Baseline", labels: labels, values: costSavings }
    ];
    return costSumBarData;
  }

  getPaybackData(opportunitiesPaybackDetails: OpportunitiesPaybackDetails, settings: Settings): PptxgenjsChartData[] {
    let values: Array<number> = new Array();
    let labels: Array<string> = new Array();
    values = [
      opportunitiesPaybackDetails.lessThanOneYear.totalSavings,
      opportunitiesPaybackDetails.oneToTwoYears.totalSavings,
      opportunitiesPaybackDetails.twoToThreeYears.totalSavings,
      opportunitiesPaybackDetails.moreThanThreeYears.totalSavings
    ];
    labels = [
      "Less than 1 Year (" + settings.currency + ")",
      "1 to 2 Years (" + settings.currency + ")",
      "2 to 3 Years (" + settings.currency + ")",
      "More than 3 Years (" + settings.currency + ")"
    ];
    let data: PptxgenjsChartData[] = [{
      name: "Opportunity Payback Details",
      labels: labels,
      values: values
    }];
    return data;
  }

  getTeamSummaryData(opportunityCardsData: Array<OpportunityCardData>): PptxgenjsChartData[] {
    let teamData = this.treasureHuntReportService.getTeamData(opportunityCardsData);
    teamData = _.orderBy(teamData, 'costSavings', 'desc');
    let values: Array<number> = new Array();
    let labels: Array<string> = new Array();
    teamData.forEach(team => {
      values.push(team.costSavings);
      labels.push(team.team);
    });
    let data: PptxgenjsChartData[] = [{
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

  getOpportunitySlideText(opportunityData: OpportunitySheet): { text: pptxgen.TextProps[], options: pptxgen.TextPropsOptions } {
    let slideText: pptxgen.TextProps[] = [
      { text: "Process / Equipment: " + opportunityData.equipment, options: { bullet: { code: '25A0' }, color: "1D428A", breakLine: true } },
      { text: "Team: " + opportunityData.owner, options: { bullet: { code: '25A0' }, color: "1D428A", breakLine: true } },
      { text: "Owner/Lead: " + opportunityData.businessUnits, options: { bullet: { code: '25A0' }, color: "1D428A", breakLine: true } },
      { text: "Description: " + opportunityData.description, options: { bullet: { code: '25A0' }, color: "1D428A", breakLine: true } },
    ];
    let slideTextProps = this.getOppSlideProperties();
    return { text: slideText, options: slideTextProps };
  }

  getOppSlideProperties(): pptxgen.TextPropsOptions {
    let textProps: pptxgen.TextPropsOptions = {
      x: 0,
      y: 1.2,
      w: 8,
      h: 4,
      align: 'left',
      color: '1D428A',
      fontSize: 28,
      fontFace: 'Arial (Body)',
      valign: 'top',
      isTextBox: true
    };
    return textProps;

  }


  createPPT(facilityInfo: FacilityInfo, settings: Settings, treasureHuntResults: TreasureHuntResults, opportunityCardsData: Array<OpportunityCardData>,
    opportunitiesPaybackDetails: OpportunitiesPaybackDetails): pptxgen {
    let pptx = new pptxgen();

    pptx.layout = "LAYOUT_WIDE";
    pptx.defineSlideMaster({
      title: "MASTER_SLIDE",
      background: { data: betterPlantsPPTimg.logoBase64 },
      margin: 0.0
    });

    let tableToSlidesProperties: pptxgen.TableToSlidesProps = this.getTableToSlideProperties();
    let slideTitleProperties: pptxgen.TextPropsOptions = this.getSlideTitleProperties();
    let barChartOptions: pptxgen.IChartOpts = this.getBarChartProperties();
    let pieChartOptions: pptxgen.IChartOpts = this.getPieChartProperties();
    let costSumBarData: PptxgenjsChartData[] = this.getCostSummaryData(treasureHuntResults);
    let teamSummaryData: PptxgenjsChartData[] = this.getTeamSummaryData(opportunityCardsData);
    let paybackBarData: PptxgenjsChartData[] = this.getPaybackData(opportunitiesPaybackDetails, settings);

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
    opportunityCardsData.forEach(opp => {
      let newSlide = pptx.addSlide({ masterName: "MASTER_SLIDE" });
      newSlide.addText('Opportunity: ' + opp.name, slideTitleProperties);
      let slideText: { text: pptxgen.TextProps[], options: pptxgen.TextPropsOptions } = this.getOpportunitySlideText(opp.opportunitySheet);
      newSlide.addText(slideText.text, slideText.options);
      newSlide.addText('Placeholder for picture', { x: 8.45, y: 1.2, w: 4.43, h: 2.81, align: 'center', fill: { color: '7ADCFF' }, color: 'FFFFFF', fontSize: 18, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true });
      let rows = [];
      rows.push(["Utility", "Energy Savings", " ", "Cost Saving", "Material Cost", "Labor Cost", "Other Cost", "Total Cost", "Simple Payback"]);
      let x: OpportunitySummary = treasureHuntResults.opportunitySummaries[counter];
      let utilityUnit: string;
      if (x.mixedIndividualResults) {
        x.mixedIndividualResults.forEach(x => {
          utilityUnit = this.getUtilityUnit(x.utilityType, settings);
          rows.push([x.utilityType, this.roundVal(x.totalEnergySavings), utilityUnit, this.roundVal(x.costSavings), x.opportunityCost.material, x.opportunityCost.labor, this.getOtherCost(x.opportunityCost), x.totalCost, this.roundVal(x.payback)]);
        });
      } else {
        utilityUnit = this.getUtilityUnit(x.utilityType, settings);
        rows.push([x.utilityType, this.roundVal(x.totalEnergySavings), utilityUnit, this.roundVal(x.costSavings), x.opportunityCost.material, x.opportunityCost.labor, this.getOtherCost(x.opportunityCost), x.totalCost, this.roundVal(x.payback)]);
      }

      newSlide.addTable(rows, { x: 0, y: 5.21, w: 13.33, colW: [1.86, 1.8, 1.11, 1.42, 1.53, 1.33, 1.29, 1.19, 1.81], color: "1D428A", fontSize: 16, fontFace: 'Arial (Body)', border: { type: "solid", color: 'FFFFFF' }, fill: { color: '7ADCFF' } });
      counter++;
    });

    return pptx;
  }

  roundVal(num: number): number {
    return Number(num.toFixed(2));
  }

  getOtherCost(oppCost: OpportunityCost): number {
    let total: number = 0;
    if (oppCost && oppCost.otherCosts && oppCost.otherCosts.length != 0) {
      oppCost.otherCosts.forEach(oCost => {
        total = total + oCost.cost;
      });
    }
    if (oppCost && oppCost.additionalSavings) {
      total = total - oppCost.additionalSavings.cost
    }
    return total;
  }

  getUtilityUnit(utilityType: string, settings: Settings): string {
    let utilityUnit: string;
    if (utilityType == 'Electricity') {
      utilityUnit = 'kWh'
    } else if (utilityType == 'Compressed Air') {
      if (settings.unitsOfMeasure == 'Imperial') {
        utilityUnit = 'kSCF';
      } else {
        utilityUnit = 'Nm<sup>3</sup>'
      }
    } else if (utilityType == 'Water' || utilityType == 'Waste Water') {
      if (settings.unitsOfMeasure == 'Imperial') {
        utilityUnit = 'kgal';
      } else {
        utilityUnit = 'm<sup>3</sup>'
      }
    } else if (utilityType == 'Steam') {
      if (settings.unitsOfMeasure == 'Imperial') {
        utilityUnit = 'klb';
      } else {
        utilityUnit = 'tonne'
      }
    } else if (utilityType == 'Natural Gas' || utilityType == 'Other Fuel') {
      if (settings.unitsOfMeasure == 'Imperial') {
        utilityUnit = 'MMBtu';
      } else {
        utilityUnit = 'MJ'
      }
    }
    return utilityUnit;
  }

}

export interface PptxgenjsChartData {
  name: string,
  labels: Array<string>,
  values: Array<number>
}