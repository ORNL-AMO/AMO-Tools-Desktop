import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem } from '../../shared/models/compressed-air-assessment';
import { TraceData } from '../../shared/models/plotting';
import { Settings } from '../../shared/models/settings';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { InventoryService } from '../baseline-tab-content/inventory-setup/inventory/inventory.service';
import { CompressedAirAssessmentModificationResults } from '../calculations/modifications/CompressedAirAssessmentModificationResults';
import { defaultPlotlyConfig } from '../../shared/helperFunctions';
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
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input()
  compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults;

  @ViewChild('centrifugalGraph', { static: false }) centrifugalGraph: ElementRef;

  compressorInventorySub: Subscription;
  selectedCompressor: CompressorInventoryItem;
  centrifugalCompressors: Array<CompressorInventoryItem>;

  showAllCompressors: boolean = false;
  showGraph: boolean;

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

  compressedAirAssessment: CompressedAirAssessment;
  compressedAirAssessmentSub: Subscription;

  constructor(private inventoryService: InventoryService,
    private compressedAirAssessmentService: CompressedAirAssessmentService,
    private plotlyService: PlotlyService) { }

  ngOnInit(): void {
    if (!this.settings) {
      this.settings = this.compressedAirAssessmentService.settings.getValue();
    }

    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.compressedAirAssessment = val;
      this.setCentrifugalCompressors();
      this.showGraph = this.centrifugalCompressors.length > 0;
      this.drawChart();
    });

    if (!this.inReport) {
      this.compressorInventorySub = this.inventoryService.selectedCompressor.subscribe(val => {
        if (val) {
          this.selectedCompressor = val;
          this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
          if (this.selectedCompressor.nameplateData.compressorType == 6 && this.selectedCompressor.compressorControls.controlType != undefined) {
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
    this.compressedAirAssessmentSub.unsubscribe();
    if (!this.inReport) {
      this.compressorInventorySub.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.drawChart();
    window.dispatchEvent(new Event("resize"));
  }

  drawChart() {
    if (this.printView || this.inReport) {
      this.showAllCompressors = true;
    }
    if (this.centrifugalGraph && this.compressedAirAssessment && this.showGraph) {
      let traceData: Array<TraceData> = new Array();

      if (this.showAllCompressors) {
        this.centrifugalCompressors.forEach(compressor => {
          if (compressor.nameplateData.compressorType == 6 && compressor.compressorControls.controlType != undefined) {
            let xData1: Array<number> = [compressor.centrifugalSpecifics.surgeAirflow, compressor.centrifugalSpecifics.maxFullLoadCapacity];
            let yData1: Array<number> = [compressor.centrifugalSpecifics.minFullLoadPressure, compressor.centrifugalSpecifics.maxFullLoadPressure];
            let name: string = compressor.name + ' Surge Limit';
            let trace1: TraceData = this.getTrace(xData1, yData1, name, compressor.color, 'soild', 'star-diamond');
            traceData.push(trace1);

            let xData2: Array<number> = [compressor.centrifugalSpecifics.maxFullLoadCapacity, compressor.nameplateData.fullLoadRatedCapacity, compressor.centrifugalSpecifics.minFullLoadCapacity];
            let yData2: Array<number> = [compressor.centrifugalSpecifics.maxFullLoadPressure, compressor.nameplateData.fullLoadOperatingPressure, compressor.centrifugalSpecifics.minFullLoadPressure];
            let name2: string = compressor.name + ' Rated Operating Curve';
            let trace2: TraceData = this.getTrace(xData2, yData2, name2, compressor.color, 'dot', 'star');
            traceData.push(trace2);
          }
        });

      } else {
        let xData1: Array<number> = [this.selectedCompressor.centrifugalSpecifics.surgeAirflow, this.selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity];
        let yData1: Array<number> = [this.selectedCompressor.centrifugalSpecifics.minFullLoadPressure, this.selectedCompressor.centrifugalSpecifics.maxFullLoadPressure];
        let name1: string = this.selectedCompressor.name + ' Surge Limit';
        let trace1: TraceData = this.getTrace(xData1, yData1, name1, this.selectedCompressor.color, 'soild', 'star-diamond');
        traceData.push(trace1);

        let xData2: Array<number> = [this.selectedCompressor.centrifugalSpecifics.maxFullLoadCapacity, this.selectedCompressor.nameplateData.fullLoadRatedCapacity, this.selectedCompressor.centrifugalSpecifics.minFullLoadCapacity];
        let yData2: Array<number> = [this.selectedCompressor.centrifugalSpecifics.maxFullLoadPressure, this.selectedCompressor.nameplateData.fullLoadOperatingPressure, this.selectedCompressor.centrifugalSpecifics.minFullLoadPressure];
        let name2: string = this.selectedCompressor.name + ' Rated Operating Curve';
        let trace2: TraceData = this.getTrace(xData2, yData2, name2, this.selectedCompressor.color, 'dot', 'star');
        traceData.push(trace2);
      }

      var layout = {
        xaxis: {
          title: {
            text: 'Airflow (' + this.getAirflowUnits() + ')',
            font: {
              size: 16
            },
          },
          // dtick: 200,
          automargin: true
        },
        yaxis: {
          title: {
            text: 'Pressure (' + this.getPressureUnits() + ')',
            font: {
              size: 16
            },
          },
          // dtick: 5,
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
      this.plotlyService.newPlot(this.centrifugalGraph.nativeElement, traceData, layout, defaultPlotlyConfig(config));
    }
  }

  getTrace(xData: Array<number>, yData: Array<number>, name: string, color: string, dash: string, symbol: string): TraceData {
    let trace: TraceData = {
      x: xData.map(data => { return data }),
      y: yData.map(data => { return data }),
      type: 'scatter',
      name: name,
      hovertemplate: "(Airflow: %{x:.2f} " + this.getAirflowUnits() + ", Pressure: %{y:.2f} " + this.getPressureUnits() + ") <extra></extra>",
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

  setCentrifugalCompressors() {
    this.centrifugalCompressors = new Array();
    if (!this.compressedAirAssessmentModificationResults) {
      this.compressedAirAssessment.compressorInventoryItems.forEach(compressor => {
        if (compressor.nameplateData.compressorType == 6 && compressor.compressorControls.controlType != undefined) {
          this.centrifugalCompressors.push(compressor);
        }
      });
      if (!this.isBaseline) {
        this.compressedAirAssessment.replacementCompressorInventoryItems.forEach(compressor => {
          if (compressor.nameplateData.compressorType == 6 && compressor.compressorControls.controlType != undefined) {
            this.centrifugalCompressors.push(compressor);
          }
        });
      }
    } else {
      this.compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries[0]?.adjustedCompressors.forEach(compressor => {
        if (compressor.nameplateData.compressorType == 6 && compressor.compressorControls.controlType != undefined) {
          this.centrifugalCompressors.push(compressor);
        }
      });
    }
  }

  getAirflowUnits(): string{
    if(this.settings.unitsOfMeasure == 'Imperial'){
      return 'acfm';
    } else {
      return 'm<sup>3</sup>/min';
    }
  }

  getPressureUnits(): string {
    if (this.settings.unitsOfMeasure == 'Imperial') {
      return 'psig';
    } else {
      return 'barg';
    }
  }

}
