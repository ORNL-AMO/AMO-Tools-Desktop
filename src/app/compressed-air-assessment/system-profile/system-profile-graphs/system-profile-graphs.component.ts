import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, Modification, ProfileSummary } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import * as Plotly from 'plotly.js';
import { ExploreOpportunitiesService } from '../../explore-opportunities/explore-opportunities.service';
import { CompressedAirAssessmentResult, CompressedAirAssessmentResultsService, DayTypeModificationResult } from '../../compressed-air-assessment-results.service';
@Component({
  selector: 'app-system-profile-graphs',
  templateUrl: './system-profile-graphs.component.html',
  styleUrls: ['./system-profile-graphs.component.css']
})
export class SystemProfileGraphsComponent implements OnInit {
  @Input()
  inModification: boolean;
  @Input()
  isBaseline: boolean;
  @Input()
  labelName: string;

  @ViewChild("airflowGraph", { static: false }) airflowGraph: ElementRef;
  @ViewChild("powerGraph", { static: false }) powerGraph: ElementRef;
  @ViewChild("capacityGraph", { static: false }) capacityGraph: ElementRef;
  @ViewChild("percentPowerGraph", { static: false }) percentPowerGraph: ElementRef;

  compressedAirAssessmentSub: Subscription;
  profileSummary: Array<ProfileSummary>;
  inventoryItems: Array<CompressorInventoryItem>;
  compressedAirAssessment: CompressedAirAssessment;
  selectedDayType: CompressedAirDayType;
  selectedDayTypeSub: Subscription;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private exploreOpportunitiesService: ExploreOpportunitiesService, private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.compressedAirAssessment = val;
      if (!this.inModification) {
        this.selectedDayType = this.compressedAirAssessment.compressedAirDayTypes.find(dayType => { return dayType.dayTypeId == this.compressedAirAssessment.systemProfile.systemProfileSetup.dayTypeId });
      }
      this.inventoryItems = val.compressorInventoryItems;
      this.setProfileData();
      this.drawCharts();
    });
    if (this.inModification) {
      this.selectedDayTypeSub = this.exploreOpportunitiesService.selectedDayType.subscribe(val => {
        this.selectedDayType = val;
        this.setProfileData();
        this.drawCharts();
      });
    }
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    if (this.selectedDayTypeSub) {
      this.selectedDayTypeSub.unsubscribe();
    }
  }


  ngAfterViewInit() {
    this.drawCharts();
  }

  setProfileData() {
    if (!this.inModification && this.compressedAirAssessment && this.selectedDayType) {
      this.profileSummary = this.compressedAirAssessmentResultsService.calculateBaselineDayTypeProfileSummary(this.compressedAirAssessment, this.selectedDayType);
    } else if (this.compressedAirAssessment && this.selectedDayType && !this.isBaseline) {
      let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
      let modification: Modification = this.compressedAirAssessment.modifications.find(mod => { return mod.modificationId == selectedModificationId });
      let compressedAirAssessmentResult: CompressedAirAssessmentResult = this.compressedAirAssessmentResultsService.calculateModificationResults(this.compressedAirAssessment, modification);
      let dayTypeModificationResult: DayTypeModificationResult = compressedAirAssessmentResult.dayTypeModificationResults.find(dayTypeResult => { return dayTypeResult.dayTypeId == this.selectedDayType.dayTypeId });
      this.profileSummary = dayTypeModificationResult.adjustedProfileSummary;
    } else if (this.compressedAirAssessment && this.selectedDayType && this.isBaseline) {
      this.profileSummary = this.compressedAirAssessmentResultsService.calculateBaselineDayTypeProfileSummary(this.compressedAirAssessment, this.selectedDayType);
    }
  }

  drawCharts() {
    this.drawAirflowChart();
    this.drawPowerChart();
    this.drawCapacityChart();
    this.drawPercentPowerChart();
  }

  drawAirflowChart() {
    if (this.profileSummary && this.airflowGraph) {
      let traceData = new Array();
      this.profileSummary.forEach(compressorProfile => {
        let trace = {
          x: compressorProfile.profileSummaryData.map(data => { return data.timeInterval }),
          y: compressorProfile.profileSummaryData.map(data => {
            if (data.order != 0) {
              return data.airflow
            } else {
              return 0;
            }
          }),
          type: 'bar',
          name: this.getCompressorName(compressorProfile.compressorId),
          marker: {
            line: {
              width: 3
            }
          },

        }
        traceData.push(trace);
      })
      var layout = this.getLayout("Airflow (acfm)", undefined, undefined);
      var config = {
        responsive: true,
        displaylogo: false
      };
      Plotly.newPlot(this.airflowGraph.nativeElement, traceData, layout, config);
    }


  }

  drawPowerChart() {
    if (this.profileSummary && this.powerGraph) {
      let traceData = new Array();
      this.profileSummary.forEach(compressorProfile => {
        let trace = {
          x: compressorProfile.profileSummaryData.map(data => { return data.timeInterval }),
          y: compressorProfile.profileSummaryData.map(data => {
            if (data.order != 0) {
              return data.power
            } else {
              return 0;
            }
          }),
          type: 'bar',
          name: this.getCompressorName(compressorProfile.compressorId),
          marker: {
            line: {
              width: 3
            }
          }
        }
        traceData.push(trace);
      })
      var layout = this.getLayout("Power (kW)", undefined, undefined);
      var config = {
        responsive: true,
        displaylogo: false
      };
      Plotly.newPlot(this.powerGraph.nativeElement, traceData, layout, config);
    }
  }
  drawCapacityChart() {
    if (this.profileSummary && this.capacityGraph) {
      let traceData = new Array();
      this.profileSummary.forEach(compressorProfile => {
        let trace = {
          x: compressorProfile.profileSummaryData.map(data => { return data.timeInterval }),
          y: compressorProfile.profileSummaryData.map(data => {
            if (data.order != 0) {
              return data.percentSystemCapacity
            } else {
              return 0;
            }
          }),
          type: 'bar',
          name: this.getCompressorName(compressorProfile.compressorId),
          marker: {
            line: {
              width: 3
            }
          }
        }
        traceData.push(trace);
      })
      var layout = this.getLayout("Capacity (%)", [0, 100], '%');
      var config = {
        responsive: true,
        displaylogo: false
      };
      Plotly.newPlot(this.capacityGraph.nativeElement, traceData, layout, config);
    }
  }

  drawPercentPowerChart() {
    if (this.profileSummary && this.percentPowerGraph) {
      let traceData = new Array();
      this.profileSummary.forEach(compressorProfile => {
        let trace = {
          x: compressorProfile.profileSummaryData.map(data => { return data.timeInterval }),
          y: compressorProfile.profileSummaryData.map(data => {
            if (data.order != 0) {
              return data.percentSystemPower
            } else {
              return 0;
            }
          }),
          type: 'bar',
          name: this.getCompressorName(compressorProfile.compressorId),
          marker: {
            line: {
              width: 3
            }
          }
        }
        traceData.push(trace);
      })
      var layout = this.getLayout("Power %", [0, 100], '%');
      var config = {
        responsive: true,
        displaylogo: false
      };
      Plotly.newPlot(this.percentPowerGraph.nativeElement, traceData, layout, config);
    }
  }


  getCompressorName(compressorId: string): string {
    let compressor: CompressorInventoryItem = this.inventoryItems.find(item => { return item.itemId == compressorId });
    if (compressor) {
      return compressor.name
    } else {
      return '';
    }
  }

  getLayout(yAxisTitle: string, yAxisRange: Array<number>, yAxisTickSuffix: string) {
    return {
      showlegend: true,
      barmode: 'stack',
      xaxis: {
        autotick: false,
        title: {
          text: 'Hour',
          font: {
            size: 16
          },
        },
        automargin: true
      },
      yaxis: {
        range: yAxisRange,
        ticksuffix: yAxisTickSuffix,
        title: {
          text: yAxisTitle,
          font: {
            size: 16
          },
        },
        hoverformat: ",.2f",
      },
      margin: {
        t: 20,
        r: 20
      },
      legend: {
        orientation: "h",
        y: 1.5
      }
    };
  }
}
