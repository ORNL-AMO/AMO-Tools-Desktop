import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  ViewChild,
  ElementRef,
  inject,
  ChangeDetectionStrategy,
} from "@angular/core";
import { PSAT, PsatOutputs, PsatInputs, PsatValid } from "../models/psat";
import { Settings } from "../../shared/models/settings";
import { PsatService } from "../../psat/psat.service";
import { PlotlyService } from "angular-plotly.js";
import { defaultPlotlyConfig } from "../helperFunctions";
import { PsatChartsService } from "../../psat/services/psat-charts.service";
@Component({
    selector: 'app-psat-sankey',
    templateUrl: './psat-sankey.component.html',
    styleUrls: ['./psat-sankey.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class PsatSankeyComponent implements OnInit {
  private readonly psatService = inject(PsatService);
  private readonly plotlyService = inject(PlotlyService);
  private readonly psatChartsService = inject(PsatChartsService);

  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;
  @Input()
  appBackground: boolean;
  @Input()
  isBaseline: boolean;
  @Input()
  baselineResults: PsatOutputs;
  @Input()
  modResults: PsatOutputs;
  @Input()
  validPsat: PsatValid;
  @Input()
  printView: boolean;
  @Input()
  labelStyle: string;
  @ViewChild("ngChart", { static: false }) ngChart: ElementRef;

  selectedResults: PsatOutputs;
  selectedInputs: PsatInputs;
  validLosses = true;

  ngOnInit() {
    this.getChartData();
  }

  ngAfterViewInit() {
    if (this.validPsat.isValid) {
      this.sankey(this.selectedResults);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.checkPsatChanges(changes);
    this.checkExploreOppsBaselineChanges(changes);
    this.checkExploreOppsModChanges(changes);
    this.checkLabelStyleChanges(changes);
  }

  checkPsatChanges(changes: SimpleChanges) {
    if (changes.psat) {
      if (!changes.psat.firstChange) {
        this.getChartData();
        if (this.validPsat.isValid) {
          this.sankey(this.selectedResults);
        }
      }
    }
  }

  checkLabelStyleChanges(changes: SimpleChanges) {
    if (changes.labelStyle && !changes.labelStyle.firstChange) {
      if (this.validPsat.isValid) {
        this.sankey(this.selectedResults);
      }
    }
  }

  checkExploreOppsBaselineChanges(changes: SimpleChanges) {
    if (changes.baselineResults) {
      if (!changes.baselineResults.firstChange) {
        this.getChartData();
        if (this.validPsat.isValid) {
          this.sankey(this.selectedResults);
        }
      }
    }
  }

  checkExploreOppsModChanges(changes: SimpleChanges) {
    if (changes.modResults) {
      if (!changes.modResults.firstChange) {
        this.getChartData();
        if (this.validPsat.isValid) {
          this.sankey(this.selectedResults);
        }
      }
    }
  }

  getChartData() {
    this.selectedInputs = JSON.parse(JSON.stringify(this.psat.inputs));
    this.psat.valid = this.psatService.isPsatValid(this.selectedInputs, this.isBaseline);
    if (!this.baselineResults && !this.modResults) {
      this.validPsat = this.psat.valid;
      this.getResults();
    } else {
      this.selectedResults = this.baselineResults || this.modResults;
    }
  }

  getResults() {
    this.selectedInputs = JSON.parse(JSON.stringify(this.psat.inputs));
    if (this.psat.valid) {
      if (this.isBaseline) {
        this.selectedResults = this.psatService.resultsExisting(this.selectedInputs, this.settings);
      } else {
        this.selectedResults = this.psatService.resultsModified(this.selectedInputs, this.settings);
      }
    } else {
      this.selectedResults = this.psatService.emptyResults();
    }
  }

  async sankey(results: PsatOutputs): Promise<void> {
    const { sankeyData, layout, connectingNodes } = this.psatChartsService.buildSankeyChartData(results, this.settings, this.labelStyle);

    if (this.appBackground) {
      layout.paper_bgcolor = 'ececec';
      layout.plot_bgcolor = 'ececec';
    }

    const config = this.printView
      ? { modeBarButtonsToRemove: ['select2d', 'lasso2d', 'hoverClosestCartesian', 'hoverCompareCartesian'], displaylogo: false, displayModeBar: false, responsive: false }
      : { modeBarButtonsToRemove: ['select2d', 'lasso2d', 'hoverClosestCartesian', 'hoverCompareCartesian'], responsive: true };

    await this.plotlyService.newPlot(this.ngChart.nativeElement, [sankeyData], layout, defaultPlotlyConfig(config));
    this.psatChartsService.applyGradientAndArrows(this.ngChart.nativeElement, connectingNodes);
  }
}
