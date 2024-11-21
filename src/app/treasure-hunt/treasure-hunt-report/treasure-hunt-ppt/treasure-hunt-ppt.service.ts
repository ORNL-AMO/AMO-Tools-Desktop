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
    
    let pieChartOptions: pptxgen.IChartOpts = this.treasureHuntPptPropertiesService.getPieChartProperties();
    let doughnutChartOptions: pptxgen.IChartOpts;
    let teamSummaryData: PptxgenjsChartData[] = this.treasureHuntPptDataService.getTeamSummaryData(opportunityCardsData);
    let paybackBarData: PptxgenjsChartData[] = this.treasureHuntPptDataService.getPaybackData(opportunitiesPaybackDetails, settings);

    pptx.layout = "LAYOUT_WIDE";
    
    pptx.defineSlideMaster({
      title: "Title Slide",
      background: { data: betterPlantsPPTimg.betterPlantsTitleSlide },
      objects: [
       {placeholder: { options:{ name:'title', type:'title', x:0.27, y:2.67, w:5.73, h:1.02, align: 'left', bold: true, color: '1D428A', fontSize: 26, fontFace: 'Arial (Headings)', valign: 'middle' },
        text:'Click to add title' }},
       {placeholder: { options:{ name:'body', type:'body', x:0.3, y:4.07, w:4.34, h:0.74, align: 'left', color: '8B93B1', fontSize: 20, fontFace: 'Arial (Body)', valign: 'middle', }, text:'Click to add subtitle' }}
      ],
      margin: 0.0
    });
    
    pptx.defineSlideMaster({
      title: "Section Header",
      background: { data: betterPlantsPPTimg.betterPlantsSectionSlide },
      objects: [
       {placeholder: { options:{ name:'title', type:'title', x:1.38, y:2.97, w:9.42, h:0.99, align: 'left', bold: true, color: 'FFFFFF', fontSize: 28, fontFace: 'Arial (Headings)', valign: 'middle' }, text:'Click To Edit Master Title Style' }},
      ],
      margin: 0.0
    });

    pptx.defineSlideMaster({
      title: "Title and Content",
      background: { data: betterPlantsPPTimg.betterPlantsSlide },
      objects: [
       {placeholder: { options:{ name:'title', type:'title', x: 0.67, y: 0, w: 11.08, h: 1.18, align: 'left', bold: true, color: 'FFFFFF', fontSize: 32, fontFace: 'Arial (Headings)', valign: 'middle'}, text:'Click to add title' }},
       {placeholder: { options:{ name:'body', type:'body', x:0.67, y:1.68, w:12, h:4.95, align: 'left', color: '000000', fontSize: 24, fontFace: 'Arial (Body)', valign: 'middle', bullet: true }, text:'Click to add text' }}
      ],
      margin: 0.0
    });

    pptx.defineSlideMaster({
      title: "Title Only",
      background: { data: betterPlantsPPTimg.betterPlantsSlide },
      objects: [
       {placeholder: { options:{ name:'title', type:'title', x: 0.67, y: 0, w: 11.08, h: 1.18, align: 'left', bold: true, color: 'FFFFFF', fontSize: 32, fontFace: 'Arial (Headings)', valign: 'middle'}, text:'Click to add title' }}
      ],
      margin: 0.0
    });

    pptx.defineSlideMaster({
      title: "Two Content",
      background: { data: betterPlantsPPTimg.betterPlantsSlide },
      objects: [
       {placeholder: { options:{ name:'title', type:'title', x:0.67, y:0, w:11.08, h:1.18, align: 'left', bold: true, color: 'FFFFFF', fontSize: 32, fontFace: 'Arial (Headings)', valign: 'middle' }, text:'Click to add title' }},
       {placeholder: { options:{ name:'body1', type:'body', x:0.67, y:1.75, w:5.74, h:4.95, align: 'left', color: '000000', fontSize: 24, fontFace: 'Arial (Body)', valign: 'middle', bullet: true }, text:'Click to add text' }},
       {placeholder: { options:{ name:'body2', type:'body', x:6.93, y:1.75, w:5.74, h:4.95, align: 'left', color: '000000', fontSize: 24, fontFace: 'Arial (Body)', valign: 'middle', bullet: true }, text:'Click to add text' }}
      ],
      margin: 0.0
    });

    pptx.defineSlideMaster({
      title: "Comparison",
      background: { data: betterPlantsPPTimg.betterPlantsSlide },
      objects: [
       {placeholder: { options:{ name:'title', type:'title', x:0.67, y:0, w:11.08, h:1.18, align: 'left', bold: true, color: 'FFFFFF', fontSize: 32, fontFace: 'Arial (Headings)', valign: 'middle' }, text:'Click to add title' }},
       {placeholder: { options:{ name:'subTitle1', type:'body', x:0.67, y:1.56, w:5.89, h:0.7, align: 'left', color: '000000', fontSize: 24, fontFace: 'Arial (Body)', valign: 'middle' }, text:'Click to add text' }},
       {placeholder: { options:{ name:'subTitle2', type:'body', x:6.77, y:1.56, w:5.89, h:0.7, align: 'left', color: '000000', fontSize: 24, fontFace: 'Arial (Body)', valign: 'middle' }, text:'Click to add text' }},
       {placeholder: { options:{ name:'body1', type:'body', x:0.67, y:2.38, w:5.89, h:4.32, align: 'left', color: '000000', fontSize: 24, fontFace: 'Arial (Body)', valign: 'middle', bullet: true }, text:'Click to add text' }},
       {placeholder: { options:{ name:'body2', type:'body', x:6.77, y:2.38, w:5.89, h:4.32, align: 'left', color: '000000', fontSize: 24, fontFace: 'Arial (Body)', valign: 'middle', bullet: true }, text:'Click to add text' }}
      ],
      margin: 0.0
    });

    pptx.defineSlideMaster({
      title: "Blank",
      background: { data: betterPlantsPPTimg.betterPlantsSlide },
      margin: 0.0
    });


    let slide1 = pptx.addSlide({ masterName: "Title Slide" });
    slide1.addText(pptTitle, {placeholder: 'title'});
    slide1.addText(date, {placeholder: 'body'});

    let thBackground = pptx.addSlide({ masterName: "Title and Content" });
    thBackground.addText('Energy Treasure Hunt Background', {placeholder: 'title'});
    thBackground.addText(
      "An Energy Treasure Hunt is a 2 - 3 day event focusing on day-to-day operational energy efficiency improvements\nProcess involves observing the facility during idle/partially idle times (frequently a Sunday) to identify energy waste\n{COMPANY/FACILITY} awarded treasure hunt through a competitive process",
      {placeholder: 'body'}
    );
    thBackground.addText(
      "Operational Efficiency Improvements",
      { x: 7.27, y: 3.89, w: 5.72, h: 0.47, margin: .25, align: 'left', color: '000000', fontSize: 22, fontFace: 'Arial (Body)', valign: 'top' }
    );
    thBackground.addText(
      "Turn off equipment when not in use\nChanging set points\nAutomating shutdowns\nReducing load on the equipment\nRecover wasted energy",
      { x: 7.27, y: 4.35, w: 5.72, h: 2.76, margin: .25, align: 'left', color: '000000', fontSize: 22, fontFace: 'Arial (Body)', valign: 'top', bullet: true }
    );
    thBackground.addImage({ data: betterPlantsPPTimg.energyTHFocusChart, x: 1.8, y: 3.9, w: 4.8, h: 3 });
    thBackground.addText(
      "Areas of Energy Efficiency Improvement",
      { x: 4.5, y: 6.3, w: 1.9, h: 0.5, margin: .25, align: 'left', color: '000000', fontSize: 10, fontFace: 'Arial (Body)', valign: 'top' }
    );

    let thConcept = pptx.addSlide({ masterName: "Title and Content" });
    thConcept.addText('Energy Treasure Hunt Concept', {placeholder: 'title'});
    thConcept.addText(
      "Cross-functional teams engage employees and outside personnel to brainstorm ways to reduce energy use throughout the plant\nFinding low cost/no cost actions to reduce energy consumption\nLearning a repeatable process to continuously improve and reduce energy consumption\nParticipants learn skills to quantify opportunities using standard methodologies, tools, and calculations",
      {placeholder: 'body'}
    );
    thConcept.addText(
      "Employees implement the Treasure Hunt process!",
      { x: 2.54, y: 5.34, w: 8.25, h: 0.6, margin: .25, align: 'left', color: '#2F5597', fontSize: 24, fontFace: 'Arial (Body)', valign: 'top' }
    );

    let previousResults = pptx.addSlide({ masterName: "Title Only" });
    previousResults.addText('Previous DOE Energy Treasure Hunt Results', {placeholder: 'title'});
    previousResults.addImage({ data: betterPlantsPPTimg.previousTHChart, x: 1.22, y: 1.57, w: 10.9, h: 5.08 });

    let thOverview = pptx.addSlide({ masterName: "Two Content" });
    thOverview.addText('{FACILITY NAME} Treasure Hunt Overview', {placeholder: 'title'});
    thOverview.addText(
      "{TREASURE HUNT DATES}\nLocation: {FACILITY LOCATION}\nAfter kickoff, safety briefing,  and tool training, we will employ the treasure hunt process\nConclude with report out to plant management",
      { placeholder: 'body1' }
    );
    thOverview.addImage({ data: betterPlantsPPTimg.thOverviewFlowChart, x: 3.44, y: 4.32, w: 2.97, h: 2.63 });
    thOverview.addText('Placeholder for agenda day 1\nPlaceholder for agenda day 2\nPlaceholder for agenda day 3', { placeholder: 'body2' });
    
    let facilitySlide = pptx.addSlide({ masterName: "Title and Content" });
    facilitySlide.addText('{Facility Name} Hunt Overview', {placeholder: 'title'});
    facilitySlide.addText('Placeholder for group picture', {placeholder: 'body'});

    let slide2 = pptx.addSlide({ masterName: "Title Only" });
    slide2.addText('Cost Summary', {placeholder: 'title'});
    slide2 = this.treasureHuntPptTableService.getCostSummaryTable(slide2, treasureHuntResults);
    let costSavingsData: PptxgenjsChartData[] = this.treasureHuntPptDataService.getCostSavingsData(treasureHuntResults);
    doughnutChartOptions = this.treasureHuntPptPropertiesService.getDoughnutChartProperties();
    slide2.addChart("doughnut", costSavingsData, doughnutChartOptions);
    let totalCurrentCost: string = this.treasureHuntPptTableService.roundValToCurrency(treasureHuntResults.totalBaselineCost);
    slide2.addText("Total Current Cost", { w: 2.27, h: 0.57, x: 1.63, y: 3.48, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });
    slide2.addText(`${totalCurrentCost}`, { w: 2, h: 0.34, x: 1.77, y: 4.05, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });


    let slide3 = pptx.addSlide({ masterName: "Title Only" });
    slide3.addText('Detailed Summary', {placeholder: 'title'});
    slide3 = this.treasureHuntPptTableService.getDetailedSummaryTable(slide3, treasureHuntResults, settings);

    let slide4 = pptx.addSlide({ masterName: "Title Only" });
    slide4.addText('Energy Utility Usage & Cost', {placeholder: 'title'});
    if (treasureHunt.currentEnergyUsage) {
      slide4 = this.treasureHuntPptTableService.getEnergyUtilityTable(slide4, treasureHunt.currentEnergyUsage, settings);
    }

    let slide5 = pptx.addSlide({ masterName: "Title Only" });
    slide5.addText('Electricity & Natural Gas Usage', {placeholder: 'title'});
    if (treasureHuntResults.electricity.energySavings) {
      let electricitySavingsData: PptxgenjsChartData[] = this.treasureHuntPptDataService.getElectricitySavingsData(treasureHuntResults);
      slide5.addChart("doughnut", electricitySavingsData, doughnutChartOptions);
      let totalElectricity: string = this.treasureHuntPptTableService.returnValAsString(treasureHuntResults.electricity.baselineEnergyUsage);
      slide5.addText("Total Current Electricity Usage (kWh)", { w: 2.27, h: 0.57, x: 1.63, y: 3.48, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });
      slide5.addText(`${totalElectricity}`, { w: 2, h: 0.34, x: 1.77, y: 4.05, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });
    }
    if (treasureHuntResults.naturalGas.energySavings) {
      let naturalGasSavingsData: PptxgenjsChartData[] = this.treasureHuntPptDataService.getNaturalGasSavingsData(treasureHuntResults);
      doughnutChartOptions = this.treasureHuntPptPropertiesService.getDoughnutChartProperties();
      doughnutChartOptions.x = 7.17;
      slide5.addChart("doughnut", naturalGasSavingsData, doughnutChartOptions);
      let totalNaturalGas: string = this.treasureHuntPptTableService.returnValAsString(treasureHuntResults.naturalGas.baselineEnergyUsage);
      let unit: string = this.treasureHuntPptTableService.getUtilityUnit('Natural Gas', settings);
      slide5.addText("Total Current Natural Gas Usage (" + `${unit}` + ")", { w: 2.27, h: 0.57, x: 8.81, y: 3.48, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });
      slide5.addText(`${totalNaturalGas}`, { w: 2, h: 0.34, x: 8.95, y: 4.05, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });
    }

    let slide6 = pptx.addSlide({ masterName: "Title Only" });
    slide6.addText('Utility Usage & Savings', {placeholder: 'title'});
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
      slide6.addText("Total Current Water Usage (" + `${unit}` + ")", { w: 2.27, h: 0.57, x: 4.39, y: 1.3, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });
      slide6.addText(`${totalWater}`, { w: 2, h: 0.34, x: 4.53, y: 1.98, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });
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
      slide6.addText("Total Current Wastewater Usage (" + `${unit}` + ")", { w: 2.27, h: 0.57, x: 11.06, y: 1.3, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });
      slide6.addText(`${totalWastewater}`, { w: 2, h: 0.34, x: 11.19, y: 1.98, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });
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
      slide6.addText("Total Current Compressed Air Usage (" + `${unit}` + ")", { w: 2.27, h: 0.57, x: 4.39, y: 4.2, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });
      slide6.addText(`${totalCompressedAir}`, { w: 2, h: 0.34, x: 4.53, y: 4.88, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });
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
      slide6.addText("Total Current Steam Usage (" + `${unit}` + ")", { w: 2.27, h: 0.57, x: 11.06, y: 4.2, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });
      slide6.addText(`${totalSteam}`, { w: 2, h: 0.34, x: 11.19, y: 4.88, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });
    }




    let slide7 = pptx.addSlide({ masterName: "Title Only" });
    slide7.addText('Carbon Emission Results (tonne CO2)', {placeholder: 'title'});
    doughnutChartOptions = this.treasureHuntPptPropertiesService.getDoughnutChartProperties();
    slide7 = this.treasureHuntPptTableService.getCarbonSummaryTable(slide7, treasureHuntResults.co2EmissionsResults);
    let carbonSavingsData: PptxgenjsChartData[] = this.treasureHuntPptDataService.getCarbonSavingsData(treasureHuntResults.co2EmissionsResults);
    slide7.addChart("doughnut", carbonSavingsData, doughnutChartOptions);
    let totalEmissions: string = this.treasureHuntPptTableService.roundValToFormatString(treasureHuntResults.co2EmissionsResults.totalCO2CurrentUse);
    slide7.addText("Total Current CO2 Emissions", { w: 2.27, h: 0.57, x: 1.63, y: 3.48, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });
    slide7.addText(`${totalEmissions}`, { w: 2, h: 0.34, x: 1.77, y: 4.05, align: 'center', bold: true, color: '000000', fontSize: 14, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });


    if (this.treasureHuntReportService.getTeamData(opportunityCardsData).length > 0) {
      let slide8 = pptx.addSlide({ masterName: "Title Only" });
      slide8.addText('Team Summary ($)', {placeholder: 'title'});
      slide8 = this.treasureHuntPptTableService.getTeamSummaryTable(slide8, opportunityCardsData);
      slide8.addChart("pie", teamSummaryData, pieChartOptions);

      let teamData = this.treasureHuntReportService.getTeamData(opportunityCardsData);
      let slideTextProps = this.treasureHuntPptPropertiesService.getOppSlideProperties();
      teamData = _.orderBy(teamData, 'team', 'asc');
      teamData.forEach(team => {
        let teamTitle = pptx.addSlide({ masterName: "Section Header"});
        teamTitle.addText('Team ' + team.team, {placeholder: 'title'});

        let slideTeamTopOpps = pptx.addSlide({ masterName: "Title and Content" });
        slideTeamTopOpps.addText('Team ' + team.team + ' - Top Opportunities', {placeholder: 'title'});
        slideTeamTopOpps.addText(
          "additional notes here",
          { x: 2.17, y: 6, w: 9, h: 1, margin: .25, align: 'left', color: 'ABABAB', fontSize: 18, fontFace: 'Arial (Body)', valign: 'top', bullet: true }
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

        let slideTeamSummary = pptx.addSlide({ masterName: "Title and Content" });
        slideTeamSummary.addText('Team ' + team.team, {placeholder: 'title'});
        slideTeamSummary.addText('Placeholder for picture', { x: 8.32, y: 1.8, w: 4.43, h: 2.81, align: 'center', fill: { color: 'BDEEFF' }, color: 'BFBFBF', fontSize: 18, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });
        slideTeamSummary.addText('Team Members:', slideTextProps);

       
        opportunityCardsData = _.orderBy(opportunityCardsData, 'name', 'asc');

        opportunityCardsData.forEach((opp: OpportunityCardData) => {
          if (opp.opportunitySheet.owner == team.team && opp.selected == true) {
            let newSlide = pptx.addSlide({ masterName: "Title and Content" });
            newSlide.addText('Opportunity: ' + opp.name, {placeholder: 'title'});
            let slideText: { text: pptxgen.TextProps[], options: pptxgen.TextPropsOptions } = this.getOpportunitySlideText(opp.opportunitySheet);
            newSlide.addText(slideText.text, slideText.options);
            newSlide.addText('Placeholder for picture', { x: 8.32, y: 1.8, w: 4.43, h: 2.81, align: 'center', fill: { color: 'BDEEFF' }, color: 'BFBFBF', fontSize: 18, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });
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
            let utilityUnit: string;
            opp.annualEnergySavings.forEach(annulEnergy => {
              utilityUnit = this.treasureHuntPptTableService.getUtilityUnit(annulEnergy.label, settings);
              rows.push([
                annulEnergy.label,
                this.treasureHuntPptTableService.roundValToFormatString(annulEnergy.savings),
                utilityUnit,
                this.treasureHuntPptTableService.roundValToCurrency(opp.annualCostSavings),
                this.treasureHuntPptTableService.roundValToCurrency(opp.opportunitySheet.opportunityCost.material),
                this.treasureHuntPptTableService.roundValToCurrency(opp.opportunitySheet.opportunityCost.labor),
                this.treasureHuntPptTableService.getOtherCost(opp.opportunitySheet.opportunityCost),
                this.treasureHuntPptTableService.roundValToCurrency(opp.implementationCost),
                this.treasureHuntPptTableService.roundValToFormatString(opp.paybackPeriod)]);
            });
              newSlide.addTable(rows, { x: 1.14, y: 5.2, w: 11.05, colW: [1.5, 1.5, 0.8, 1.25, 1.25, 1.25, 1.25, 1.25, 1], color: "1D428A", fontSize: 12, fontFace: 'Arial (Body)', border: { type: "solid", color: '1D428A' }, fill: { color: 'BDEEFF' }, align: 'left', valign: 'middle' });
          }
        });

        let slideTeamAllOpps = pptx.addSlide({ masterName: "Title and Content" });
        slideTeamAllOpps.addText('Team ' + team.team + ' - All Opportunities', {placeholder: 'title'});
        for (let i = 3; i < teamOpportunities.length; i++) {
          let x: OpportunitySummary = teamOpportunities[i];
          if (x) {
            rows = this.treasureHuntPptTableService.getOpportunityTableRows(rows, x, settings);
          }
        }
        slideTeamAllOpps.addTable(rows, { x: 0.14, y: 1.5, w: 11.05, colW: [2, 1.5, 1.5, 0.8, 1.25, 1.25, 1.25, 1.25, 1.25, 1], color: "1D428A", fontSize: 12, fontFace: 'Arial (Body)', border: { type: "solid", color: '1D428A' }, fill: { color: 'BDEEFF' }, align: 'left', valign: 'middle' });

        let slideTeamBestPractices = pptx.addSlide({ masterName: "Title and Content" });
        slideTeamBestPractices.addText('Team ' + team.team + ' - Best Practices', {placeholder: 'title'});
        slideTeamBestPractices.addText(
          "Outline key best practices identified in Treasure Hunt here\ntype here\ntype here",
          { x: 2.17, y: 1.4, w: 9, h: 5.5, margin: .25, align: 'left', color: 'ABABAB', fontSize: 18, fontFace: 'Arial (Body)', valign: 'top', bullet: true }
        );

      });

    }

    let oppsWithNoTeam = pptx.addSlide({ masterName: "Section Header"});
    oppsWithNoTeam.addText('Other Opportunities', { w: '100%', h: '100%', align: 'center', bold: true, color: 'FFFFFF', fontSize: 68, fontFace: 'Arial (Headings)', valign: 'middle', isTextBox: true, autoFit: true });
   
    opportunityCardsData.forEach((opp) => {
      if (!opp.opportunitySheet.owner && opp.selected == true) {
        let newSlide = pptx.addSlide({ masterName: "Title and Content" });
        newSlide.addText('Opportunity: ' + opp.name, {placeholder: 'title'});
        let slideText: { text: pptxgen.TextProps[], options: pptxgen.TextPropsOptions } = this.getOpportunitySlideText(opp.opportunitySheet);
        newSlide.addText(slideText.text, slideText.options);
        newSlide.addText('Placeholder for picture', { x: 8.32, y: 1.8, w: 4.43, h: 2.81, align: 'center', fill: { color: 'BDEEFF' }, color: 'BFBFBF', fontSize: 18, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });
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
        let utilityUnit: string;
        opp.annualEnergySavings.forEach(annulEnergy => {
          utilityUnit = this.treasureHuntPptTableService.getUtilityUnit(annulEnergy.label, settings);
          rows.push([
            annulEnergy.label,
            this.treasureHuntPptTableService.roundValToFormatString(annulEnergy.savings),
            utilityUnit,
            this.treasureHuntPptTableService.roundValToCurrency(opp.annualCostSavings),
            this.treasureHuntPptTableService.roundValToCurrency(opp.opportunitySheet.opportunityCost.material),
            this.treasureHuntPptTableService.roundValToCurrency(opp.opportunitySheet.opportunityCost.labor),
            this.treasureHuntPptTableService.getOtherCost(opp.opportunitySheet.opportunityCost),
            this.treasureHuntPptTableService.roundValToCurrency(opp.implementationCost),
            this.treasureHuntPptTableService.roundValToFormatString(opp.paybackPeriod)]);
        });
        newSlide.addTable(rows, { x: 1.14, y: 5.2, w: 11.05, colW: [1.5, 1.5, 0.8, 1.25, 1.25, 1.25, 1.25, 1.25, 1], color: "1D428A", fontSize: 12, fontFace: 'Arial (Body)', border: { type: "solid", color: '1D428A' }, fill: { color: 'BDEEFF' }, align: 'left', valign: 'middle' });
      }
    });

    let summaryTransition = pptx.addSlide({ masterName: "Section Header"});
    summaryTransition.addText('Summary', { w: '100%', h: '100%', align: 'center', bold: true, color: 'FFFFFF', fontSize: 68, fontFace: 'Arial (Headings)', valign: 'middle', isTextBox: true, autoFit: true });


    let slide9 = pptx.addSlide({ masterName: "Title and Content" });
    slide9.addText('Opportunity Payback Details ($)', {placeholder: 'title'});
    slide9 = this.treasureHuntPptTableService.getOppPaybackTable(slide9, opportunitiesPaybackDetails);
    slide9.addChart("pie", paybackBarData, pieChartOptions);

    let slide10 = pptx.addSlide({ masterName: "Title and Content" });
    slide10.addText('Best Practices', {placeholder: 'title'});
    slide10.addText(
      "Outline key best practices identified in Treasure Hunt here\ntype here\ntype here",
      { x: 2.17, y: 1.4, w: 9, h: 5.5, margin: .25, align: 'left', color: 'ABABAB', fontSize: 18, fontFace: 'Arial (Body)', valign: 'top', bullet: true }
    );

    let slide11 = pptx.addSlide({ masterName: "Title and Content" });
    slide11.addText('Other Opportunities Not Evaluated', {placeholder: 'title'});
    slide11.addText(
      "Outline any major opportunities identified, but not evaluated here\ntype here\ntype here",
      { x: 2.17, y: 1.4, w: 9, h: 5.5, margin: .25, align: 'left', color: 'ABABAB', fontSize: 18, fontFace: 'Arial (Body)', valign: 'top', bullet: true }
    );

    let slide12 = pptx.addSlide({ masterName: "Title and Content" });
    slide12.addText('{FACILITY NAME} Next Actions', {placeholder: 'title'});
    slide12.addText(
      "Outline the next stpes for the facility here\ntype here\ntype here",
      { x: 2.17, y: 1.4, w: 9, h: 5.5, margin: .25, align: 'left', color: 'ABABAB', fontSize: 18, fontFace: 'Arial (Body)', valign: 'top', bullet: true }
    );

    let slide13 = pptx.addSlide({ masterName: "Title and Content" });
    slide13.addText('{COMPANY NAME}/DOE Partnership Future Actions', {placeholder: 'title'});
    slide13.addText(
      "Outline the next steps for the company and DOE/Better Plants here\ntype here\ntype here",
      { x: 2.17, y: 1.4, w: 9, h: 5.5, margin: .25, align: 'left', color: 'ABABAB', fontSize: 18, fontFace: 'Arial (Body)', valign: 'top', bullet: true }
    );

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
      { text: "Process / Equipment: " + equipmentName, options: { bullet: true, color: "1D428A", breakLine: true, autoFit: true } },
      { text: "Team: " + team, options: { bullet: true, color: "1D428A", breakLine: true, autoFit: true } },
      { text: "Owner/Lead: " + owner, options: { bullet: true, color: "1D428A", breakLine: true, autoFit: true } },
      { text: "Description: " + opportunityData.description, options: { bullet: true, color: "1D428A", breakLine: true, autoFit: true } },
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