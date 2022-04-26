import { Injectable } from '@angular/core';
import { FacilityInfo, Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { Directory } from '../../shared/models/directory';
import { TreasureHuntResults, OpportunitiesPaybackDetails, OpportunitySummary, TreasureHunt, OpportunitySheet } from '../../shared/models/treasure-hunt';
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

  getOpportunitySlideText(opportunityData: OpportunitySheet): {text: pptxgen.TextProps[], options: pptxgen.TextPropsOptions} {
    let slideText: pptxgen.TextProps[] = [
      { text: "Process / Equipment: " + opportunityData.equipment, options: { bullet: { code: '25A0' }, color: "1D428A", breakLine: true } },
      { text: "Plant: USER INPUT", options: { bullet: { code: '25A0' }, color: "1D428A", breakLine: true } },
      { text: "Business Unit: " + opportunityData.businessUnits, options: { bullet: { code: '25A0' }, color: "1D428A", breakLine: true } },
      { text: "Description: " + opportunityData.description, options: { bullet: { code: '25A0' }, color: "1D428A", breakLine: true } },
    ];
    let slideTextProps = this.getOppSlideProperties();
    return {text: slideText, options: slideTextProps};
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

}

export interface PptxgenjsChartData {
  name: string,
  labels: Array<string>,
  values: Array<number>
}