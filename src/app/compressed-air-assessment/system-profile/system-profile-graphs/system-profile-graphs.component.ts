import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressorInventoryItem, ProfileSummary, ProfileSummaryData } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { SystemProfileService } from '../system-profile.service';
import * as Plotly from 'plotly.js';
@Component({
  selector: 'app-system-profile-graphs',
  templateUrl: './system-profile-graphs.component.html',
  styleUrls: ['./system-profile-graphs.component.css']
})
export class SystemProfileGraphsComponent implements OnInit {

  @ViewChild("airflowGraph", { static: false }) airflowGraph: ElementRef;
  @ViewChild("powerGraph", { static: false }) powerGraph: ElementRef;
  @ViewChild("capacityGraph", { static: false }) capacityGraph: ElementRef;

  compressedAirAssessmentSub: Subscription;
  profileSummary: Array<ProfileSummary>;
  inventoryItems: Array<CompressorInventoryItem>;
  constructor(private systemProfileService: SystemProfileService, private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.profileSummary = this.systemProfileService.calculateDayTypeProfileSummary(val, val.systemProfile.systemProfileSetup.dayTypeId);
      this.inventoryItems = val.compressorInventoryItems;
      this.drawCharts();
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
  }


  ngAfterViewInit() {
    this.drawCharts();
  }


  drawCharts() {
    this.drawAirflowChart();
    this.drawPowerChart();
    this.drawCapacityChart();
  }

  drawAirflowChart() {
    if (this.profileSummary && this.airflowGraph) {
      // let chartData: Array<ProfileChartData> = this.getChartData();
      let traceData = new Array();
      let rgbaInterval: number = 1 / (this.profileSummary.length + 1);
      let rgbaOpacity: number = 1;
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
          name:this.getCompressorName(compressorProfile.compressorId),
          marker: {
            color: 'rgba(112, 48, 160,' + rgbaOpacity + ')',
            line: {
              width: 3
            }
          },

        }
        traceData.push(trace);
        rgbaOpacity = rgbaOpacity - rgbaInterval;
      })
      var layout = {
        showlegend: true,
        barmode: 'stack',
        title: {
          text: 'System Airflow',
          font: {
            size: 18
          },
        },
        xaxis: {
          // ticksuffix: '%',
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
          // range: [0, 105],
          // ticksuffix: '%',
          title: {
            text: 'Airflow (acfm)',
            font: {
              size: 16
            },
          },
          hoverformat: ",.2f",
          // automargin: true
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
      var config = {
        responsive: true,
        displaylogo: false
      };
      Plotly.newPlot(this.airflowGraph.nativeElement, traceData, layout, config);
    }


  }

  drawPowerChart() {
    if (this.profileSummary && this.powerGraph) {
      // let chartData: Array<ProfileChartData> = this.getChartData();
      let traceData = new Array();
      let rgbaInterval: number = 1 / (this.profileSummary.length + 1);
      let rgbaOpacity: number = 1;

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
            color: 'rgba(112, 48, 160,' + rgbaOpacity + ')',
            line: {
              width: 3
            }
          }
        }
        traceData.push(trace);
        rgbaOpacity = rgbaOpacity - rgbaInterval;
      })
      var layout = {
        showlegend: true,
        barmode: 'stack',
        title: {
          text: 'System Power',
          font: {
            size: 18
          },
        },
        xaxis: {
          // ticksuffix: '%',
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
          // range: [0, 105],
          // ticksuffix: '%',
          title: {
            text: 'Power (kW)',
            font: {
              size: 16
            },
          },
          hoverformat: ",.2f",
          // automargin: true
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
      var config = {
        responsive: true,
        displaylogo: false
      };
      Plotly.newPlot(this.powerGraph.nativeElement, traceData, layout, config);
    }
  }
  drawCapacityChart() {
    if (this.profileSummary && this.capacityGraph) {
      // let chartData: Array<ProfileChartData> = this.getChartData();
      let traceData = new Array();
      let rgbaInterval: number = 1 / (this.profileSummary.length + 1);
      let rgbaOpacity: number = 1;
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
            color: 'rgba(112, 48, 160,' + rgbaOpacity + ')',
            line: {
              width: 3
            }
          }
        }
        traceData.push(trace);
        rgbaOpacity = rgbaOpacity - rgbaInterval;
      })
      var layout = {
        showlegend: true,
        barmode: 'stack',
        title: {
          text: 'System Capacity',
          font: {
            size: 18
          },
        },
        xaxis: {
          // ticksuffix: '%',
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
          range: [0, 105],
          ticksuffix: '%',
          title: {
            text: 'Capacity (%)',
            font: {
              size: 16
            },
          },
          hoverformat: ",.2f",
          // automargin: true
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
      var config = {
        responsive: true,
        displaylogo: false
      };
      Plotly.newPlot(this.capacityGraph.nativeElement, traceData, layout, config);
    }
  }

  getCompressorName(compressorId: string): string {
    let compressor: CompressorInventoryItem = this.inventoryItems.find(item => {return item.itemId == compressorId});
    if(compressor){
      return compressor.name
    }else{
      return '';
    }
  }
}
