import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, EndUse } from '../../shared/models/compressed-air-assessment';
import { Settings } from '../../shared/models/settings';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';

@Component({
  selector: 'app-end-use-chart',
  templateUrl: './end-use-chart.component.html',
  styleUrls: ['./end-use-chart.component.css']
})
export class EndUseChartComponent implements OnInit {
  @ViewChild('overviewPieChart', { static: false }) overviewPieChart: ElementRef;
  settings: Settings;
  units: string;
  selectedDayType: CompressedAirDayType;
  compressedAirAssessment: CompressedAirAssessment;
  // endUses: Array<EndUse>;
  // compressedAirDayTypes: Array<CompressedAirDayType>;
  compressedAirAssessmentSub: Subscription;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private plotlyService: PlotlyService) { }

  ngOnInit(): void {
    this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.selectedDayType = this.compressedAirAssessment.compressedAirDayTypes[0];
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    if (this.settings.unitsOfMeasure == 'Imperial') {
      this.units = 'acfm';
    } else {
      this.units = 'm<sup>3</sup>/min';
    }
  }

  ngAfterViewInit() {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(compressedAirAssessment => {
      this.compressedAirAssessment = compressedAirAssessment;
      console.log('enduses', this.compressedAirAssessment.endUses);
      let endUseEnergyData: Array<EndUseEnergyData> = this.getEndUseEnergySummary(compressedAirAssessment.endUses);
      var data = [{
        values: endUseEnergyData.map(val => { return val.dayTypeAverageAirflow }),
        labels: endUseEnergyData.map(val => { return val.endUseName }),
        marker: {
          colors: endUseEnergyData.map(val => { return 'rgb(' + val.color + ')' }),
          line: {
            width: endUseEnergyData.map(val => { return 2 }),
            color: '#fff'
          }
        },
        type: 'pie',
        textposition: 'auto',
        insidetextorientation: "horizontal",
        textinfo: 'label+value',
        texttemplate: '%{label}<br>%{value:$,.0f}',
        hoverinfo: 'label+percent',
        hovertemplate: '%{percent:%,.2f} <extra></extra>',
        // direction: "clockwise",
        // rotation: -45,
        sort: false,
        automargin: true
      }];
      let layout = {
        title: {
          text: `${this.selectedDayType.name} Average ${this.units}`
        },
        showlegend: false,
        font: {
          size: 12,
        },
      };

      let configOptions = {
        modeBarButtonsToRemove: ['hoverClosestPie'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      };
      this.plotlyService.newPlot(this.overviewPieChart.nativeElement, data, layout, configOptions);
    })
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
  }


  getEndUseEnergySummary(endUses: Array<EndUse>, selectedDayType?: CompressedAirDayType): Array<EndUseEnergyData> {
    if (!selectedDayType) {
      // get all
    }

    let endUseEnergyData = new Array<EndUseEnergyData>();
    endUses.forEach(endUse => {
      endUseEnergyData.push({
          dayTypeAverageAirflow: undefined,
          endUseName: endUse.endUseName,
          color: undefined
        })
    });

    return endUseEnergyData;
  }

  setSelectedDayType(selectedDayType: CompressedAirDayType) {
    this.getEndUseEnergySummary(this.compressedAirAssessment.endUses, selectedDayType);
  } 
}


export interface EndUseEnergyData {
  dayTypeAverageAirflow: number, endUseName: string, color: string 
}