import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, Modification, ProfileSummary, ProfileSummaryData } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { SystemProfileService } from '../system-profile.service';
import * as Plotly from 'plotly.js';
import { ExploreOpportunitiesService } from '../../explore-opportunities/explore-opportunities.service';
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
  constructor(private systemProfileService: SystemProfileService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private exploreOpportunitiesService: ExploreOpportunitiesService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.compressedAirAssessment = val;
      this.inventoryItems = val.compressorInventoryItems;
      this.setProfileData();
      this.drawCharts();
    });

    this.selectedDayTypeSub = this.exploreOpportunitiesService.selectedDayType.subscribe(val => {
      this.selectedDayType = val;
      this.setProfileData();
      this.drawCharts();
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.selectedDayTypeSub.unsubscribe();
  }


  ngAfterViewInit() {
    this.drawCharts();
  }

  setProfileData() {
    if (!this.inModification && this.compressedAirAssessment) {
      this.profileSummary = this.systemProfileService.calculateDayTypeProfileSummary(this.compressedAirAssessment, this.compressedAirAssessment.systemProfile.systemProfileSetup.dayTypeId);
    } else if (this.compressedAirAssessment && this.selectedDayType && !this.isBaseline) {
      let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
      let modification: Modification = this.compressedAirAssessment.modifications.find(mod => { return mod.modificationId == selectedModificationId });
      this.profileSummary = this.systemProfileService.flowReallocation(this.compressedAirAssessment, this.selectedDayType, modification, true);
    } else if (this.compressedAirAssessment && this.selectedDayType && this.isBaseline) {
      this.profileSummary = this.systemProfileService.calculateDayTypeProfileSummary(this.compressedAirAssessment, this.selectedDayType.dayTypeId);
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
            // color: 'rgba(112, 48, 160,' + rgbaOpacity + ')',
            line: {
              width: 3
            }
          },

        }
        traceData.push(trace);
      })
      var layout = {
        showlegend: true,
        barmode: 'stack',
        // title: {
        //   text: 'System Airflow',
        //   font: {
        //     size: 18
        //   },
        // },
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
          title: {
            text: 'Airflow (acfm)',
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
      var layout = {
        showlegend: true,
        barmode: 'stack',
        // title: {
        //   text: 'System Power',
        //   font: {
        //     size: 18
        //   },
        // },
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
          title: {
            text: 'Power (kW)',
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
      var layout = {
        showlegend: true,
        barmode: 'stack',
        // title: {
        //   text: 'System Capacity',
        //   font: {
        //     size: 18
        //   },
        // },
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
          range: [0, 105],
          ticksuffix: '%',
          title: {
            text: 'Capacity (%)',
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
      var layout = {
        showlegend: true,
        barmode: 'stack',
        // title: {
        //   text: 'System Capacity',
        //   font: {
        //     size: 18
        //   },
        // },
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
          range: [0, 105],
          ticksuffix: '%',
          title: {
            text: 'Power (%)',
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
}
