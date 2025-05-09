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
    styleUrls: ['./centrifugal-graph.component.css'],
    standalone: false
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
  compressorInventorySub: Subscription;
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
      this.compressorInventorySub = this.inventoryService.selectedCompressor.subscribe(val => {
        if (val) {
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
        } else {
          this.showGraph = false;
        }
      });
    }
  }

  ngOnDestroy() {
    if (!this.inReport) {
      this.compressorInventorySub.unsubscribe();
    }
  }

  ngOnChanges() {
    if (this.showGraph) {
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
    if (this.centrifugalGraph && this.compressedAirAssessment && this.showGraph) {
      let traceData: Array<TraceData> = new Array();

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
            let xData1: Array<number> = [compressor.centrifugalSpecifics.surgeAirflow, compressor.centrifugalSpecifics.maxFullLoadCapacity];
            let yData1: Array<number> = [compressor.centrifugalSpecifics.minFullLoadPressure, compressor.centrifugalSpecifics.maxFullLoadPressure];
            let name: string = compressor.name + ' Surge Limit';
            let trace1: TraceData = this.getTrace(xData1, yData1, name, currentTraceColor, 'soild', 'star-diamond');
            traceData.push(trace1);

            currentColorIndex++;
            currentTraceColor = this.plotlyTraceColors[currentColorIndex];

            let xData2: Array<number> = [compressor.centrifugalSpecifics.maxFullLoadCapacity, compressor.nameplateData.fullLoadRatedCapacity, compressor.centrifugalSpecifics.minFullLoadCapacity];
            let yData2: Array<number> = [compressor.centrifugalSpecifics.maxFullLoadPressure, compressor.nameplateData.fullLoadOperatingPressure, compressor.centrifugalSpecifics.minFullLoadPressure];
            let name2: string = compressor.name + ' Rated Operating Curve';
            let trace2: TraceData = this.getTrace(xData2, yData2, name2, currentTraceColor, 'dot', 'star');
            traceData.push(trace2);
          }
        });

      } else {
        let xData1: Array<number> = [this.centrifugalSpecifics.surgeAirflow, this.centrifugalSpecifics.maxFullLoadCapacity];
        let yData1: Array<number> = [this.centrifugalSpecifics.minFullLoadPressure, this.centrifugalSpecifics.maxFullLoadPressure];
        let name1: string = this.selectedCompressor.name + ' Surge Limit';
        let trace1: TraceData = this.getTrace(xData1, yData1, name1, '#1f77b4', 'soild', 'star-diamond');
        traceData.push(trace1);

        let xData2: Array<number> = [this.centrifugalSpecifics.maxFullLoadCapacity, this.selectedCompressor.nameplateData.fullLoadRatedCapacity, this.centrifugalSpecifics.minFullLoadCapacity];
        let yData2: Array<number> = [this.centrifugalSpecifics.maxFullLoadPressure, this.selectedCompressor.nameplateData.fullLoadOperatingPressure, this.centrifugalSpecifics.minFullLoadPressure];
        let name2: string = this.selectedCompressor.name + ' Rated Operating Curve';
        let trace2: TraceData = this.getTrace(xData2, yData2, name2, '#ff7f0e', 'dot', 'star');
        traceData.push(trace2);
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

  getTrace(xData: Array<number>, yData: Array<number>, name: string, color: string, dash: string, symbol: string): TraceData {
    let trace: TraceData = {
      x: xData.map(data => { return data }),
      y: yData.map(data => { return data }),
      type: 'scatter',
      name: name,
      hovertemplate: "(Airflow: %{x:.2f} acfm, Pressure: %{y:.2f} psig) <extra></extra>",
      mode: 'lines+markers',
      line: {
        shape: 'spline',
        dash: dash,
        color: color
      },
      marker: {
        size: 12,
        symbol: symbol,
      },
      fillcolor: color
    };

    return trace;

  }


}
