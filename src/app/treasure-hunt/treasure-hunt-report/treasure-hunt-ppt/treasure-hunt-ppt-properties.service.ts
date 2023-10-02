import { Injectable } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { TreasureHuntResults, OpportunitiesPaybackDetails, OpportunitySummary, OpportunitySheet, OpportunityCost, TreasureHuntCo2EmissionsResults, EnergyUsage, TreasureHunt } from '../../../shared/models/treasure-hunt';
import { TreasureHuntReportService } from '../treasure-hunt-report.service';
import { OpportunityCardData } from '../../treasure-chest/opportunity-cards/opportunity-cards.service';
import pptxgen from 'pptxgenjs';
import * as _ from 'lodash';
import * as betterPlantsPPTimg from '../better-plants-ppt-img.js';
import moment from 'moment';

@Injectable()
export class TreasureHuntPptPropertiesService {

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
            isTextBox: true,
            autoFit: true
        };
        return slideTitleProps;
    }

    getPieChartProperties() {
        let pieChartOptions: pptxgen.IChartOpts = {
            x: 5.54,
            y: 1.2,
            w: 7.79,
            h: 5.7,
            showPercent: false,
            showValue: true,
            dataLabelFormatCode: '#,##0',
            chartColors: ['1E7640', '2ABDDA', '84B641', 'BC8FDD', '#E1CD00', '#306DBE', '#A03123', '#7FD7E9', '#DE762D', '#948A54', '#A9D58B', '#FFE166', '#DD7164', '#3f4a7d'],
            dataLabelPosition: 'bestFit',
            dataLabelFontSize: 14,
            dataLabelColor: '000000',
            dataLabelFontBold: true,
            showLegend: true,
            legendFontSize: 16,
            legendColor: '2E4053',
            legendPos: 'l',
            firstSliceAng: 330
        };
        return pieChartOptions;
    }

    getDoughnutChartProperties() {
        let doughnutChartOptions: pptxgen.IChartOpts = {
            x: 0,
            y: 1.2,
            w: 5.54,
            h: 5.7,
            holeSize: 50,
            showPercent: true,
            showValue: false,
            showLabel: true,
            dataLabelFormatCode: '#%',
            chartColors: ['1E7640', '2ABDDA', '84B641', 'BC8FDD', '#E1CD00', '#306DBE', '#A03123', '#7FD7E9', '#DE762D', '#948A54', '#A9D58B', '#FFE166', '#DD7164', '#3f4a7d'],
            dataLabelPosition: 'bestFit',
            dataLabelFontSize: 14,
            dataLabelColor: '000000',
            dataLabelFontBold: true,
            showLegend: false,
            firstSliceAng: 0,
            showTitle: false,
            legendFontSize: 14,
            legendFontFace: 'Arial',
            titleFontSize: 18,
            titleFontFace: 'Arial',
        };
        return doughnutChartOptions;
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
            barGrouping: 'clustered',
            dataLabelFormatCode: '$#,##0',
            dataLabelPosition: 'bestFit',
            chartColors: ['1E7640', '2ABDDA', '84B641', 'BC8FDD', '#E1CD00', '#306DBE', '#A03123', '#7FD7E9', '#DE762D', '#948A54', '#A9D58B', '#FFE166', '#DD7164', '#3f4a7d'],
            legendFontSize: 16,
            legendColor: '2E4053',
            dataLabelColor: '000000',
            dataLabelFontBold: false,
            catAxisLabelColor: '2E4053',
            valAxisLabelColor: '2E4053',
            dataLabelFontSize: 12,
            catAxisLabelFontSize: 16
        };
        return barChartOptions;
    }


    getCostBarChartProperties() {
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
            chartColors: ['2ABDDA', '1E7640'],
            legendFontSize: 16,
            legendColor: '2E4053',
            dataLabelColor: '000000',
            dataLabelFontBold: false,
            catAxisLabelColor: '2E4053',
            valAxisLabelColor: '2E4053',
            dataLabelFontSize: 12,
            catAxisLabelFontSize: 16
        };
        return barChartOptions;
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
            isTextBox: true,
            autoFit: true
        };
        return textProps;

    }




}
