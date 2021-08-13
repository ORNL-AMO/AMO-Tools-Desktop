import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, Modification, ProfileSummary, ProfileSummaryTotal } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { SystemProfileService } from '../../system-profile/system-profile.service';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';
import * as Plotly from 'plotly.js';

@Component({
  selector: 'app-explore-opportunities-bar-chart',
  templateUrl: './explore-opportunities-bar-chart.component.html',
  styleUrls: ['./explore-opportunities-bar-chart.component.css']
})
export class ExploreOpportunitiesBarChartComponent implements OnInit {


  @ViewChild("barChart", { static: false }) barChart: ElementRef;

  compressedAirAssessmentSub: Subscription;
  adjustedProfileSummary: Array<ProfileSummary>;
  selectedDayType: CompressedAirDayType;
  selectedDayTypeSub: Subscription;
  dayTypeOptions: Array<CompressedAirDayType>;
  compressedAirAssessment: CompressedAirAssessment;

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private systemProfileService: SystemProfileService,
    private exploreOpportunitiesService: ExploreOpportunitiesService) { }

  ngOnInit(): void {
    this.selectedDayTypeSub = this.exploreOpportunitiesService.selectedDayType.subscribe(val => {
      this.selectedDayType = val;
      this.calculateProfile();
      this.drawChart();
    });


    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        this.compressedAirAssessment = val;
        this.calculateProfile();
        this.drawChart();
      }
    });
  }

  ngAfterViewInit() {
    this.drawChart();
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.selectedDayTypeSub.unsubscribe();
  }

  drawChart() {
    if (this.adjustedProfileSummary && this.barChart) {
      var layout = {
        showlegend: true,
        barmode: 'stack',
        title: {
          text: 'Calc Power, kW',
          font: {
            size: 18
          },
        },
        xaxis: {
          autotick: false,
          title: {
            text: '1',
            font: {
              size: 16
            },
          },
          automargin: true,
          anchor: 'x1',
        },
        yaxis: {
          title: {
            text: 'Calc Power, kW',
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
      // let chartData: Array<ProfileChartData> = this.getChartData();
      let traceData = new Array();

      for (let i = 0; i < 24; i++) {
        let xaxis: string = "x1";
        if (i != 0) {
          xaxis = "x" + (i + 1);
        }

        let yData = new Array();
        this.adjustedProfileSummary.forEach(compressorProfile => {
          let y = compressorProfile.profileSummaryData.find(data => { return data.timeInterval == i });
          if (!isNaN(y.power)) {
            yData.push(y.power);
          } else {
            yData.push(0);
          }
          if (!isNaN(y.airflow)) {
            yData.push(y.airflow);
          } else {
            yData.push(0);
          }
          traceData.push({
            x: ["Power", "Airflow"],
            y: yData,
            type: "bar",
            name: this.getCompressorName(compressorProfile.compressorId),
            xaxis: xaxis,
            barmode: 'stack',
          });
        });
      }


      this.adjustedProfileSummary.forEach(compressorProfile => {
        let trace = {
          x: compressorProfile.profileSummaryData.map(data => { return data.timeInterval }),
          y: compressorProfile.profileSummaryData.map(data => {
            if (!isNaN(data.power)) {
              return data.airflow
            } else {
              return 0;
            }
          }),
          type: 'bar',
          name: this.getCompressorName(compressorProfile.compressorId),
          // marker: {
          //   color: 'rgba(112, 48, 160,' + rgbaOpacity + ')',
          //   line: {
          //     width: 3
          //   }
          // },

        }
        traceData.push(trace);
        // rgbaOpacity = rgbaOpacity - rgbaInterval;
      })

      var config = {
        responsive: true,
        displaylogo: false
      };
      Plotly.newPlot(this.barChart.nativeElement, traceData, layout, config);
    }
  }


  calculateProfile() {
    if (this.compressedAirAssessment && this.selectedDayType) {
      let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
      let modification: Modification = this.compressedAirAssessment.modifications.find(mod => { return mod.modificationId == selectedModificationId });
      this.adjustedProfileSummary = this.systemProfileService.flowReallocation(this.compressedAirAssessment, this.selectedDayType, modification, true);
    }
  }

  getCompressorName(compressorId: string): string {
    let compressor: CompressorInventoryItem = this.compressedAirAssessment.compressorInventoryItems.find(item => { return item.itemId == compressorId });
    if (compressor) {
      return compressor.name
    } else {
      return '';
    }
  }
}
