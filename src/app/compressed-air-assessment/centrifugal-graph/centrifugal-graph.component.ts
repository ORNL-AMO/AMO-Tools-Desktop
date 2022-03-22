import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { Subscription } from 'rxjs';
import { CentrifugalSpecifics, CompressedAirAssessment, CompressorInventoryItem } from '../../shared/models/compressed-air-assessment';
import { TraceData } from '../../shared/models/plotting';
import { Settings } from '../../shared/models/settings';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { InventoryService } from '../inventory/inventory.service';

@Component({
  selector: 'app-centrifugal-graph',
  templateUrl: './centrifugal-graph.component.html',
  styleUrls: ['./centrifugal-graph.component.css']
})
export class CentrifugalGraphComponent implements OnInit {

  @Input()
  inReport: boolean;

  @Input()
  printView: boolean;

  @Input()
  compressedAirAssessment: CompressedAirAssessment;

  @Input()
  settings: Settings;

  @ViewChild('centrifugalGraph', { static: false }) centrifugalGraph: ElementRef;

  selectedCompressorType: number;
  dataSub: Subscription;
  selectedCompressor: CompressorInventoryItem;
  centrifugalSpecifics: CentrifugalSpecifics;
  centrifugalCompressors: Array<CompressorInventoryItem>;

  showAllCompressors: boolean = false;
  showGraph: boolean;

  // From Plotly source
  plotlyTraceColors: Array<string> = [
    '#1f77b4',  // muted blue
    '#ff7f0e',  // safety orange
    '#2ca02c',  // cooked asparagus green
    '#d62728',  // brick red
    '#9467bd',  // muted purple
    '#8c564b',  // chestnut brown
    '#e377c2',  // raspberry yogurt pink
    '#7f7f7f',  // middle gray
    '#bcbd22',  // curry yellow-green
    '#17becf'   // blue-teal
  ];
  plotlyMarkerShapes: Array<string> = [
    'star',
    'star-diamond',
    'hexagram',
    'star-square',
    'square',
    'diamond',
    'cross',
    'x',
    'diamond-wide',
    'diamond-tall'
  ];

  constructor(private inventoryService: InventoryService,
    private compressedAirAssessmentService: CompressedAirAssessmentService,
    private plotlyService: PlotlyService) { }

  ngOnInit(): void {
    if (!this.settings) {
      this.settings = this.compressedAirAssessmentService.settings.getValue();
    }
    if (this.inReport) {
      this.showAllCompressors = true;
      this.compressedAirAssessment.compressorInventoryItems.forEach(compressor => {
        if (compressor.nameplateData.compressorType == 6 && compressor.compressorControls.controlType != undefined) {
          this.selectedCompressor = compressor;
          this.centrifugalSpecifics = compressor.centrifugalSpecifics;
          this.selectedCompressorType = compressor.nameplateData.compressorType;
          this.showGraph = true;
        } else {
          this.showGraph = false;
        }
      });
      this.drawChart();
    } else {
      this.dataSub = this.inventoryService.selectedCompressor.subscribe(val => {
        this.selectedCompressor = val;
        this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
        this.centrifugalSpecifics = this.selectedCompressor.centrifugalSpecifics;
        this.selectedCompressorType = this.selectedCompressor.nameplateData.compressorType;
        if (this.selectedCompressorType == 6 && this.selectedCompressor.compressorControls.controlType != undefined) {
          this.showGraph = true;
        } else {
          this.showGraph = false;
        }
        this.drawChart();
      });
    }
  }

  ngOnDestroy() {
    if (!this.inReport) {
      this.dataSub.unsubscribe();
    }
  }

  ngOnChanges() {
    if (this.centrifugalGraph) {
      this.drawChart();
    }
  }

  ngAfterViewInit() {
    this.drawChart();
    window.dispatchEvent(new Event("resize"));
  }

  drawChart() {
    if (this.printView) {
      this.showAllCompressors = true;
    }
    if (this.centrifugalGraph && this.compressedAirAssessment) {
      let traceData: Array<TraceData> = new Array();
      if (this.showGraph) {
        if (this.showAllCompressors) {
          let currentColorIndex: number = -1;
          this.compressedAirAssessment.compressorInventoryItems.forEach(compressor => {
            let currentTraceColor: string;
            if (compressor.nameplateData.compressorType == 6 && compressor.compressorControls.controlType != undefined) {
              if (currentColorIndex == 9) {
                currentColorIndex = -1;
              }
              currentColorIndex++;
              currentTraceColor = this.plotlyTraceColors[currentColorIndex];
              let trace1: TraceData = {
                x: [compressor.centrifugalSpecifics.surgeAirflow, compressor.centrifugalSpecifics.maxFullLoadCapacity],
                y: [compressor.centrifugalSpecifics.minFullLoadPressure, compressor.centrifugalSpecifics.maxFullLoadPressure],
                type: 'scatter',
                name: compressor.name + ' Surge Limit',
                hovertemplate: "(Airflow: %{x:.2f} acfm, Pressure: %{y:.2f} psig) <extra></extra>",
                mode: 'lines+markers',
                marker: {
                  size: 12,
                  symbol: 'star-diamond',
                },
                fillcolor: currentTraceColor
              };
              traceData.push(trace1);

              currentColorIndex++;
              currentTraceColor = this.plotlyTraceColors[currentColorIndex];

              let xData: Array<number> = [compressor.centrifugalSpecifics.maxFullLoadCapacity, compressor.nameplateData.fullLoadRatedCapacity, compressor.centrifugalSpecifics.minFullLoadCapacity];
              let yData: Array<number> = [compressor.centrifugalSpecifics.maxFullLoadPressure, compressor.nameplateData.fullLoadOperatingPressure, compressor.centrifugalSpecifics.minFullLoadPressure];
              let trace2: TraceData = {
                x: xData.map(data => { return data }),
                y: yData.map(data => { return data }),
                type: 'scatter',
                name: compressor.name + ' Rated Operating Curve',
                hovertemplate: "(Airflow: %{x:.2f} acfm, Pressure: %{y:.2f} psig) <extra></extra>",
                mode: 'lines+markers',
                line: {
                  shape: 'spline',
                  dash: 'dot',
                  color: currentTraceColor
                },
                marker: {
                  size: 12,
                  symbol: 'star',
                },
                fillcolor: currentTraceColor
              };
              traceData.push(trace2);
            }
          });

        } else {
          let trace1: TraceData = {
            x: [this.centrifugalSpecifics.surgeAirflow, this.centrifugalSpecifics.maxFullLoadCapacity],
            y: [this.centrifugalSpecifics.minFullLoadPressure, this.centrifugalSpecifics.maxFullLoadPressure],
            type: 'scatter',
            name: this.selectedCompressor.name + ' Surge Limit',
            hovertemplate: "(Airflow: %{x:.2f} acfm, Pressure: %{y:.2f} psig) <extra></extra>",
            mode: 'lines+markers',
            marker: {
              size: 12,
              symbol: 'star-diamond',
            },
            fillcolor: '#1f77b4'
          };
          traceData.push(trace1);

          let xData: Array<number> = [this.centrifugalSpecifics.maxFullLoadCapacity, this.selectedCompressor.nameplateData.fullLoadRatedCapacity, this.centrifugalSpecifics.minFullLoadCapacity];
          let yData: Array<number> = [this.centrifugalSpecifics.maxFullLoadPressure, this.selectedCompressor.nameplateData.fullLoadOperatingPressure, this.centrifugalSpecifics.minFullLoadPressure];
          let trace2: TraceData = {
            x: xData.map(data => { return data }),
            y: yData.map(data => { return data }),
            type: 'scatter',
            name: this.selectedCompressor.name + ' Rated Operating Curve',
            hovertemplate: "(Airflow: %{x:.2f} acfm, Pressure: %{y:.2f} psig) <extra></extra>",
            mode: 'lines+markers',
            line: {
              shape: 'spline',
              dash: 'dot',
              color: '#ff7f0e'
            },
            marker: {
              size: 12,
              symbol: 'star',
            },
            fillcolor: '#ff7f0e'
          };
          traceData.push(trace2);
        }
      }


      var layout = {
        xaxis: {
          title: {
            text: 'Airflow (acfm)',
            font: {
              size: 16
            },
          },
          dtick: 200,
          automargin: true
        },
        yaxis: {
          title: {
            text: 'Pressure (psig)',
            font: {
              size: 16
            },
          },
          dtick: 5,
          hoverformat: ",.2f",
        },
        margin: {
          t: 20,
          r: 20
        },
        showlegend: true,
        legend: {
          orientation: "h",
          y: 1.5
        }
      };
      var config = {
        responsive: true,
        displaylogo: false
      };
      this.plotlyService.newPlot(this.centrifugalGraph.nativeElement, traceData, layout, config);

    }


  }


}
