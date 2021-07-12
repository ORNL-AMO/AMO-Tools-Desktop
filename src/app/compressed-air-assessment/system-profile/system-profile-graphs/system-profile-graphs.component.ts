import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProfileSummary, ProfileSummaryData } from '../../../shared/models/compressed-air-assessment';
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
  profileSummary: Array<{compressorName: string, summaryData: Array<ProfileSummaryData>}>;
  constructor(private systemProfileService: SystemProfileService, private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.profileSummary = this.systemProfileService.calculateProfileSummary(val);
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
      let rgbaInterval: number =  1 / (this.profileSummary.length + 1);
      let rgbaOpacity: number = 1;
      this.profileSummary.forEach(compressorProfile => {
        let trace = {
          x: compressorProfile.summaryData.map(data => { return data.timeInterval }),
          y: compressorProfile.summaryData.map(data => { return data.airflow }),
          type: 'bar',
          name: compressorProfile.compressorName,
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
        barmode: 'stack',
        title: {
          text: 'System Air Flow',
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
      let rgbaInterval: number =  1 / (this.profileSummary.length + 1);
      let rgbaOpacity: number = 1;

      this.profileSummary.forEach(compressorProfile => {
        let trace = {
          x: compressorProfile.summaryData.map(data => { return data.timeInterval }),
          y: compressorProfile.summaryData.map(data => { return data.power }),
          type: 'bar',
          name: compressorProfile.compressorName,
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
      let rgbaInterval: number =  1 / (this.profileSummary.length + 1);
      let rgbaOpacity: number = 1;
      this.profileSummary.forEach(compressorProfile => {
        let trace = {
          x: compressorProfile.summaryData.map(data => { return data.timeInterval }),
          y: compressorProfile.summaryData.map(data => { return data.percentSystemCapacity }),
          type: 'bar',
          name: compressorProfile.compressorName,
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
}
