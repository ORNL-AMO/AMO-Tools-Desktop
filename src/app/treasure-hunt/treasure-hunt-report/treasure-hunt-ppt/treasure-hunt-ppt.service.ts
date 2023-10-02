import { Injectable } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { TreasureHuntResults, OpportunitiesPaybackDetails, OpportunitySummary, OpportunitySheet, OpportunityCost, TreasureHuntCo2EmissionsResults, EnergyUsage, TreasureHunt } from '../../../shared/models/treasure-hunt';
import { TreasureHuntReportService } from '../treasure-hunt-report.service';
import { OpportunityCardData } from '../../treasure-chest/opportunity-cards/opportunity-cards.service';
import pptxgen from 'pptxgenjs';
import * as _ from 'lodash';
import * as betterPlantsPPTimg from '../better-plants-ppt-img.js';
import moment from 'moment';
import { TreasureHuntPptPropertiesService } from './treasure-hunt-ppt-properties.service';
import { PptxgenjsChartData, TreasureHuntPptDataService } from './treasure-hunt-ppt-data.service';
import { TreasureHuntPptTableService } from './treasure-hunt-ppt-table.service';

@Injectable()
export class TreasureHuntPptService {

  constructor(private treasureHuntReportService: TreasureHuntReportService,
    private treasureHuntPptPropertiesService: TreasureHuntPptPropertiesService,
    private treasureHuntPptDataService: TreasureHuntPptDataService,
    private treasureHuntPptTableService: TreasureHuntPptTableService) { }


  createPPT(settings: Settings, treasureHunt: TreasureHunt, treasureHuntResults: TreasureHuntResults, opportunityCardsData: Array<OpportunityCardData>,
    opportunitiesPaybackDetails: OpportunitiesPaybackDetails): pptxgen {
    let pptx = new pptxgen();

    let pptTitle = this.getpptTitle(settings);
    let date: string = this.getCurrentDate();

    pptx.layout = "LAYOUT_WIDE";
    pptx.defineSlideMaster({
      title: "MASTER_SLIDE",
      background: { data: betterPlantsPPTimg.betterPlantsSlide },
      margin: 0.0
    });

    let slideTitleProperties: pptxgen.TextPropsOptions = this.treasureHuntPptPropertiesService.getSlideTitleProperties();
    let pieChartOptions: pptxgen.IChartOpts = this.treasureHuntPptPropertiesService.getPieChartProperties();
    let doughnutChartOptions: pptxgen.IChartOpts;
    let teamSummaryData: PptxgenjsChartData[] = this.treasureHuntPptDataService.getTeamSummaryData(opportunityCardsData);
    let paybackBarData: PptxgenjsChartData[] = this.treasureHuntPptDataService.getPaybackData(opportunitiesPaybackDetails, settings);

    let slide1 = pptx.addSlide();
    slide1.background = { data: betterPlantsPPTimg.betterPlantsTitleSlide };
    slide1.addText(pptTitle, { x: 0.3, y: 2.1, w: 5.73, h: 1.21, align: 'center', bold: true, color: '1D428A', fontSize: 26, fontFace: 'Arial (Headings)', valign: 'middle', isTextBox: true, autoFit: true });
    slide1.addText(date, { x: 0.3, y: 4.19, w: 4.34, h: 0.74, align: 'left', color: '8B93B1', fontSize: 20, fontFace: 'Arial (Body)', valign: 'top', isTextBox: true, autoFit: true });


    let slide2 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide2.addText('Cost Summary', slideTitleProperties);
    slide2 = this.treasureHuntPptTableService.getCostSummaryTable(slide2, treasureHuntResults);
    let costSavingsData: PptxgenjsChartData[] = this.treasureHuntPptDataService.getCostSavingsData(treasureHuntResults);
    doughnutChartOptions = this.treasureHuntPptPropertiesService.getDoughnutChartProperties();
    slide2.addChart("doughnut", costSavingsData, doughnutChartOptions);
    let totalCurrentCost: string = this.treasureHuntPptTableService.roundValToCurrency(treasureHuntResults.totalBaselineCost);
    slide2.addText("Total Current Cost", { w: 2.27, h: 0.57, x: 1.63, y: 3.48, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial', valign: 'middle', isTextBox: true, autoFit: true });
    slide2.addText(`${totalCurrentCost}`, { w: 2, h: 0.34, x: 1.77, y: 4.05, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial', valign: 'middle', isTextBox: true, autoFit: true });


    let slide3 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide3.addText('Detailed Summary', slideTitleProperties);
    slide3 = this.treasureHuntPptTableService.getDetailedSummaryTable(slide3, treasureHuntResults, settings);

    let slide4 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide4.addText('Energy Utility Usage & Cost', slideTitleProperties);
    if (treasureHunt.currentEnergyUsage) {
      slide4 = this.treasureHuntPptTableService.getEnergyUtilityTable(slide4, treasureHunt.currentEnergyUsage, settings);
    }

    let slide5 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide5.addText('Electricity & Natural Gas Usage', slideTitleProperties);
    if (treasureHuntResults.electricity.energySavings) {
      let electricitySavingsData: PptxgenjsChartData[] = this.treasureHuntPptDataService.getElectricitySavingsData(treasureHuntResults);
      slide5.addChart("doughnut", electricitySavingsData, doughnutChartOptions);
      let totalElectricity: string = this.treasureHuntPptTableService.returnValAsString(treasureHuntResults.electricity.baselineEnergyUsage);
      slide5.addText("Total Current Electricity Usage (kWh)", { w: 2.27, h: 0.57, x: 1.63, y: 3.48, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial', valign: 'middle', isTextBox: true, autoFit: true });
      slide5.addText(`${totalElectricity}`, { w: 2, h: 0.34, x: 1.77, y: 4.05, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial', valign: 'middle', isTextBox: true, autoFit: true });
    }
    if (treasureHuntResults.naturalGas.energySavings) {
      let naturalGasSavingsData: PptxgenjsChartData[] = this.treasureHuntPptDataService.getNaturalGasSavingsData(treasureHuntResults);
      doughnutChartOptions = this.treasureHuntPptPropertiesService.getDoughnutChartProperties();
      doughnutChartOptions.x = 7.17;
      slide5.addChart("doughnut", naturalGasSavingsData, doughnutChartOptions);
      let totalNaturalGas: string = this.treasureHuntPptTableService.returnValAsString(treasureHuntResults.naturalGas.baselineEnergyUsage);
      let unit: string = this.treasureHuntPptTableService.getUtilityUnit('Natural Gas', settings);
      slide5.addText("Total Current Natural Gas Usage (" + `${unit}` + ")", { w: 2.27, h: 0.57, x: 8.81, y: 3.48, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial', valign: 'middle', isTextBox: true, autoFit: true });
      slide5.addText(`${totalNaturalGas}`, { w: 2, h: 0.34, x: 8.95, y: 4.05, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial', valign: 'middle', isTextBox: true, autoFit: true });
    }

    let slide6 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide6.addText('Utility Usage & Savings', slideTitleProperties);
    if (treasureHuntResults.water.energySavings) {
      let waterSavingsData: PptxgenjsChartData[] = this.treasureHuntPptDataService.getWaterSavingsData(treasureHuntResults);
      doughnutChartOptions = this.treasureHuntPptPropertiesService.getDoughnutChartProperties();
      doughnutChartOptions.w = 6.66;
      doughnutChartOptions.h = 2.9;
      doughnutChartOptions.x = 0.01;
      doughnutChartOptions.y = 1.2;
      doughnutChartOptions.showLegend = true;
      doughnutChartOptions.showLabel = false;
      doughnutChartOptions.showTitle = true;
      doughnutChartOptions.title = "Water";
      slide6.addChart("doughnut", waterSavingsData, doughnutChartOptions);
      let totalWater: string = this.treasureHuntPptTableService.returnValAsString(treasureHuntResults.water.baselineEnergyUsage);
      let unit: string = this.treasureHuntPptTableService.getUtilityUnit('Water', settings);
      slide6.addText("Total Current Water Usage (" + `${unit}` + ")", { w: 2.27, h: 0.57, x: 4.39, y: 1.3, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial', valign: 'middle', isTextBox: true, autoFit: true });
      slide6.addText(`${totalWater}`, { w: 2, h: 0.34, x: 4.53, y: 1.98, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial', valign: 'middle', isTextBox: true, autoFit: true });
    }
    if (treasureHuntResults.wasteWater.energySavings) {
      let wastewaterSavingsData: PptxgenjsChartData[] = this.treasureHuntPptDataService.getWastewaterSavingsData(treasureHuntResults);
      doughnutChartOptions = this.treasureHuntPptPropertiesService.getDoughnutChartProperties();
      doughnutChartOptions.w = 6.66;
      doughnutChartOptions.h = 2.9;
      doughnutChartOptions.x = 6.66;
      doughnutChartOptions.y = 1.2;
      doughnutChartOptions.showLegend = true;
      doughnutChartOptions.showLabel = false;
      doughnutChartOptions.showTitle = true;
      doughnutChartOptions.title = "Wastewater";
      slide6.addChart("doughnut", wastewaterSavingsData, doughnutChartOptions);
      let totalWastewater: string = this.treasureHuntPptTableService.returnValAsString(treasureHuntResults.wasteWater.baselineEnergyUsage);
      let unit: string = this.treasureHuntPptTableService.getUtilityUnit('Waste Water', settings);
      slide6.addText("Total Current Wastewater Usage (" + `${unit}` + ")", { w: 2.27, h: 0.57, x: 11.06, y: 1.3, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial', valign: 'middle', isTextBox: true, autoFit: true });
      slide6.addText(`${totalWastewater}`, { w: 2, h: 0.34, x: 11.19, y: 1.98, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial', valign: 'middle', isTextBox: true, autoFit: true });
    }
    if (treasureHuntResults.compressedAir.energySavings) {
      let compressedAirSavingsData: PptxgenjsChartData[] = this.treasureHuntPptDataService.getCompAirSavingsData(treasureHuntResults);
      doughnutChartOptions = this.treasureHuntPptPropertiesService.getDoughnutChartProperties();
      doughnutChartOptions.w = 6.66;
      doughnutChartOptions.h = 2.9;
      doughnutChartOptions.x = 0.01;
      doughnutChartOptions.y = 4.1;
      doughnutChartOptions.showLegend = true;
      doughnutChartOptions.showLabel = false;
      doughnutChartOptions.showTitle = true;
      doughnutChartOptions.title = "Compressed Air";
      slide6.addChart("doughnut", compressedAirSavingsData, doughnutChartOptions);
      let totalCompressedAir: string = this.treasureHuntPptTableService.returnValAsString(treasureHuntResults.compressedAir.baselineEnergyUsage);
      let unit: string = this.treasureHuntPptTableService.getUtilityUnit('Compressed Air', settings);
      slide6.addText("Total Current Compressed Air Usage (" + `${unit}` + ")", { w: 2.27, h: 0.57, x: 4.39, y: 4.2, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial', valign: 'middle', isTextBox: true, autoFit: true });
      slide6.addText(`${totalCompressedAir}`, { w: 2, h: 0.34, x: 4.53, y: 4.88, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial', valign: 'middle', isTextBox: true, autoFit: true });
    }
    if (treasureHuntResults.steam.energySavings) {
      let steamSavingsData: PptxgenjsChartData[] = this.treasureHuntPptDataService.getSteamSavingsData(treasureHuntResults);
      doughnutChartOptions = this.treasureHuntPptPropertiesService.getDoughnutChartProperties();
      doughnutChartOptions.w = 6.66;
      doughnutChartOptions.h = 2.9;
      doughnutChartOptions.x = 6.66;
      doughnutChartOptions.y = 4.1;
      doughnutChartOptions.showLegend = true;
      doughnutChartOptions.showLabel = false;
      doughnutChartOptions.showTitle = true;
      doughnutChartOptions.title = "Steam";
      slide6.addChart("doughnut", steamSavingsData, doughnutChartOptions);
      let totalSteam: string = this.treasureHuntPptTableService.returnValAsString(treasureHuntResults.steam.baselineEnergyUsage);
      let unit: string = this.treasureHuntPptTableService.getUtilityUnit('Steam', settings);
      slide6.addText("Total Current Steam Usage (" + `${unit}` + ")", { w: 2.27, h: 0.57, x: 11.06, y: 4.2, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial', valign: 'middle', isTextBox: true, autoFit: true });
      slide6.addText(`${totalSteam}`, { w: 2, h: 0.34, x: 11.19, y: 4.88, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial', valign: 'middle', isTextBox: true, autoFit: true });
    }




    let slide7 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide7.addText('Carbon Emission Results (tonne CO2)', slideTitleProperties);
    doughnutChartOptions = this.treasureHuntPptPropertiesService.getDoughnutChartProperties();
    slide7 = this.treasureHuntPptTableService.getCarbonSummaryTable(slide7, treasureHuntResults.co2EmissionsResults);
    let carbonSavingsData: PptxgenjsChartData[] = this.treasureHuntPptDataService.getCarbonSavingsData(treasureHuntResults.co2EmissionsResults);
    slide7.addChart("doughnut", carbonSavingsData, doughnutChartOptions);
    let totalEmissions: string = this.treasureHuntPptTableService.roundValToFormatString(treasureHuntResults.co2EmissionsResults.totalCO2CurrentUse);
    slide7.addText("Total Current CO2 Emissions", { w: 2.27, h: 0.57, x: 1.63, y: 3.48, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial', valign: 'middle', isTextBox: true, autoFit: true });
    slide7.addText(`${totalEmissions}`, { w: 2, h: 0.34, x: 1.77, y: 4.05, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial', valign: 'middle', isTextBox: true, autoFit: true });


    if (this.treasureHuntReportService.getTeamData(opportunityCardsData).length > 0) {
      let slide8 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
      slide8.addText('Team Summary ($)', slideTitleProperties);
      slide8 = this.treasureHuntPptTableService.getTeamSummaryTable(slide8, opportunityCardsData);
      slide8.addChart("pie", teamSummaryData, pieChartOptions);

      let teamData = this.treasureHuntReportService.getTeamData(opportunityCardsData);
      let slideTextProps = this.treasureHuntPptPropertiesService.getOppSlideProperties();
      teamData = _.orderBy(teamData, 'team', 'asc');
      teamData.forEach(team => {
        let slideTeamSummary = pptx.addSlide({ masterName: "MASTER_SLIDE" });
        slideTeamSummary.addText('Team ' + team.team, slideTitleProperties);
        slideTeamSummary.addText('Placeholder for picture', { x: 8.45, y: 1.2, w: 4.43, h: 2.81, align: 'center', fill: { color: '4d94ff' }, color: 'BFBFBF', fontSize: 18, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });
        slideTeamSummary.addText('Team Members:', slideTextProps);

        let slideTeamTopOpps = pptx.addSlide({ masterName: "MASTER_SLIDE" });
        slideTeamTopOpps.addText('Team ' + team.team + ' - Top Opportunities', slideTitleProperties);
        slideTeamTopOpps.addText(
          "additional notes here",
          { x: 2.17, y: 6, w: 9, h: 1, margin: .25, align: 'left', color: 'ABABAB', fontSize: 18, fontFace: 'Arial', valign: 'top', bullet: true }
        );
        let teamOpportunities: OpportunitySummary[] = [];
        treasureHuntResults.opportunitySummaries.forEach(teamOpp => {
          if (teamOpp.team == team.team) {
            teamOpportunities.push(teamOpp);
          }
        });
        teamOpportunities = _.orderBy(teamOpportunities, 'payback', 'asc');
        let rows = [];
        rows.push([
          { text: "Opportunity Name", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
          { text: "Utility", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
          { text: "Energy Savings", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
          { text: "Unit", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
          { text: "Cost Saving", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
          { text: "Material Cost", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
          { text: "Labor Cost", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
          { text: "Other Cost", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
          { text: "Total Cost", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
          { text: "Payback (Years)", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } }
        ]);
        for (let i = 0; i < 3; i++) {
          let x: OpportunitySummary = teamOpportunities[i];
          if (x) {
            rows = this.treasureHuntPptTableService.getOpportunityTableRows(rows, x, settings);
          }
        }
        slideTeamTopOpps.addTable(rows, { x: 0.14, y: 2.5, w: 11.05, colW: [2, 1.5, 1.5, 0.8, 1.25, 1.25, 1.25, 1.25, 1.25, 1], color: "1D428A", fontSize: 12, fontFace: 'Arial (Body)', border: { type: "solid", color: '1D428A' }, fill: { color: 'BDEEFF' }, align: 'left', valign: 'middle' });

        let slideTeamAllOpps = pptx.addSlide({ masterName: "MASTER_SLIDE" });
        slideTeamAllOpps.addText('Team ' + team.team + ' - All Opportunities', slideTitleProperties);
        for (let i = 3; i < teamOpportunities.length; i++) {
          let x: OpportunitySummary = teamOpportunities[i];
          if (x) {
            rows = this.treasureHuntPptTableService.getOpportunityTableRows(rows, x, settings);
          }
        }
        slideTeamAllOpps.addTable(rows, { x: 0.14, y: 1.2, w: 11.05, colW: [2, 1.5, 1.5, 0.8, 1.25, 1.25, 1.25, 1.25, 1.25, 1], color: "1D428A", fontSize: 12, fontFace: 'Arial (Body)', border: { type: "solid", color: '1D428A' }, fill: { color: 'BDEEFF' }, align: 'left', valign: 'middle' });

        let slideTeamBestPractices = pptx.addSlide({ masterName: "MASTER_SLIDE" });
        slideTeamBestPractices.addText('Team ' + team.team + ' - Best Practices', slideTitleProperties);
        slideTeamBestPractices.addText(
          "Outline key best practices identified in Treasure Hunt here\ntype here\ntype here",
          { x: 2.17, y: 1.4, w: 9, h: 5.5, margin: .25, align: 'left', color: 'ABABAB', fontSize: 18, fontFace: 'Arial', valign: 'top', bullet: true }
        );

      });

    }



    let slide9 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide9.addText('Opportunity Payback Details ($)', slideTitleProperties);
    slide9 = this.treasureHuntPptTableService.getOppPaybackTable(slide9, opportunitiesPaybackDetails);
    slide9.addChart("pie", paybackBarData, pieChartOptions);

    let slide10 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide10.addText('Best Practices', slideTitleProperties);
    slide10.addText(
      "Outline key best practices identified in Treasure Hunt here\ntype here\ntype here",
      { x: 2.17, y: 1.4, w: 9, h: 5.5, margin: .25, align: 'left', color: 'ABABAB', fontSize: 18, fontFace: 'Arial', valign: 'top', bullet: true }
    );

    let slide11 = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide11.addText('Other Opportunities Not Evaluated', slideTitleProperties);
    slide11.addText(
      "Outline any major opportunities identified, but not evaluated here\ntype here\ntype here",
      { x: 2.17, y: 1.4, w: 9, h: 5.5, margin: .25, align: 'left', color: 'ABABAB', fontSize: 18, fontFace: 'Arial', valign: 'top', bullet: true }
    );

    let slide12 = pptx.addSlide();
    slide12.background = { data: betterPlantsPPTimg.betterPlantsSectionSlide };
    slide12.addText('Opportunity Summaries', { w: '100%', h: '100%', align: 'center', bold: true, color: 'FFFFFF', fontSize: 68, fontFace: 'Arial (Headings)', valign: 'middle', isTextBox: true, autoFit: true });

    let counter: number = 0;
    opportunityCardsData.forEach(opp => {
      let newSlide = pptx.addSlide({ masterName: "MASTER_SLIDE" });
      newSlide.addText('Opportunity: ' + opp.name, slideTitleProperties);
      let slideText: { text: pptxgen.TextProps[], options: pptxgen.TextPropsOptions } = this.getOpportunitySlideText(opp.opportunitySheet);
      newSlide.addText(slideText.text, slideText.options);
      newSlide.addText('Placeholder for picture', { x: 8.45, y: 1.2, w: 4.43, h: 2.81, align: 'center', fill: { color: 'BDEEFF' }, color: 'BFBFBF', fontSize: 18, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });
      let rows = [];
      rows.push([
        { text: "Utility", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
        { text: "Energy Savings", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
        { text: "Unit", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
        { text: "Cost Saving", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
        { text: "Material Cost", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
        { text: "Labor Cost", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
        { text: "Other Cost", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
        { text: "Total Cost", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
        { text: "Payback (Years)", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } }
      ]);
      let x: OpportunitySummary = treasureHuntResults.opportunitySummaries[counter];
      let utilityUnit: string;
      if (x.mixedIndividualResults) {
        x.mixedIndividualResults.forEach(x => {
          utilityUnit = this.treasureHuntPptTableService.getUtilityUnit(x.utilityType, settings);
          rows.push([x.utilityType, this.treasureHuntPptTableService.roundValToFormatString(x.totalEnergySavings), utilityUnit, this.treasureHuntPptTableService.roundValToCurrency(x.costSavings), this.treasureHuntPptTableService.roundValToCurrency(x.opportunityCost.material), this.treasureHuntPptTableService.roundValToCurrency(x.opportunityCost.labor), this.treasureHuntPptTableService.getOtherCost(x.opportunityCost), this.treasureHuntPptTableService.roundValToCurrency(x.totalCost), this.treasureHuntPptTableService.roundValToFormatString(x.payback)]);
        });
      } else {
        utilityUnit = this.treasureHuntPptTableService.getUtilityUnit(x.utilityType, settings);
        rows.push([x.utilityType, this.treasureHuntPptTableService.roundValToFormatString(x.totalEnergySavings), utilityUnit, this.treasureHuntPptTableService.roundValToCurrency(x.costSavings), this.treasureHuntPptTableService.roundValToCurrency(x.opportunityCost.material), this.treasureHuntPptTableService.roundValToCurrency(x.opportunityCost.labor), this.treasureHuntPptTableService.getOtherCost(x.opportunityCost), this.treasureHuntPptTableService.roundValToCurrency(x.totalCost), this.treasureHuntPptTableService.roundValToFormatString(x.payback)]);
      }

      newSlide.addTable(rows, { x: 1.14, y: 5.2, w: 11.05, colW: [1.5, 1.5, 0.8, 1.25, 1.25, 1.25, 1.25, 1.25, 1], color: "1D428A", fontSize: 12, fontFace: 'Arial (Body)', border: { type: "solid", color: '1D428A' }, fill: { color: 'BDEEFF' }, align: 'left', valign: 'middle' });
      counter++;
    });

    return pptx;
  }



  getOpportunitySlideText(opportunityData: OpportunitySheet): { text: pptxgen.TextProps[], options: pptxgen.TextPropsOptions } {
    let equipmentName: string = this.getEquipmentName(opportunityData.equipment);
    let team: string = "";
    let owner: string = "";
    if (opportunityData.owner != undefined) {
      team = opportunityData.owner;
    }
    if (opportunityData.businessUnits != undefined) {
      owner = opportunityData.businessUnits;
    }
    let slideText: pptxgen.TextProps[] = [
      { text: "Process / Equipment: " + equipmentName, options: { bullet: { code: '25A0' }, color: "1D428A", breakLine: true, autoFit: true } },
      { text: "Team: " + team, options: { bullet: { code: '25A0' }, color: "1D428A", breakLine: true, autoFit: true } },
      { text: "Owner/Lead: " + owner, options: { bullet: { code: '25A0' }, color: "1D428A", breakLine: true, autoFit: true } },
      { text: "Description: " + opportunityData.description, options: { bullet: { code: '25A0' }, color: "1D428A", breakLine: true, autoFit: true } },
    ];
    let slideTextProps = this.treasureHuntPptPropertiesService.getOppSlideProperties();
    return { text: slideText, options: slideTextProps };
  }

  getEquipmentName(oppEquipment: string): string {
    let equipmentName: string = " ";
    if (oppEquipment == 'motor') {
      equipmentName = 'Motor';
    } else if (oppEquipment == 'pump') {
      equipmentName = 'Pump';
    } else if (oppEquipment == 'fan') {
      equipmentName = 'Fan';
    } else if (oppEquipment == 'compressedAir') {
      equipmentName = 'Compressed Air';
    } else if (oppEquipment == 'lights') {
      equipmentName = 'Lights';
    } else if (oppEquipment == 'processHeating') {
      equipmentName = 'Process Heating';
    } else if (oppEquipment == 'processCooling') {
      equipmentName = 'Process Cooling';
    } else if (oppEquipment == 'steam') {
      equipmentName = 'Steam';
    } else if (oppEquipment == 'other') {
      equipmentName = 'Other';
    } else if (oppEquipment == 'hvac') {
      equipmentName = 'HVAC System';
    }
    return equipmentName;
  }

  getpptTitle(settings: Settings): string {
    if (settings.facilityInfo && settings.facilityInfo.facilityName) {
      return settings.facilityInfo.facilityName + " Treasure Hunt Report";
    } else {
      return "Treasure Hunt Report";
    }
  }

  getCurrentDate(): string {
    const date: Date = new Date();
    let formatedDate: string = moment(date).format("MMM D, YYYY").toString();
    return formatedDate;
  }


}