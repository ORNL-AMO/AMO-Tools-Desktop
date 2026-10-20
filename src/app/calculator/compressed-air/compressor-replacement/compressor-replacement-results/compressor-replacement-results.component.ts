import { Component, Input } from '@angular/core';
import { CompressorReplacementData, CompressorReplacementResults } from '../compressor-replacement.service';
@Component({ selector: 'app-compressor-replacement-results', templateUrl: './compressor-replacement-results.component.html', styleUrls: ['./compressor-replacement-results.component.css'], standalone: false })
export class CompressorReplacementResultsComponent {
  @Input() results: CompressorReplacementResults;
  @Input() baselineRows: Array<CompressorReplacementData>;
  @Input() modificationRows: Array<CompressorReplacementData>;
  @Input() modificationExists: boolean;
  @Input() powerUnit: string;
  @Input() airflowUnit: string;
  @Input() airVolumeUnit: string;
  @Input() costVolumeUnit: string;
  @Input() isMetric: boolean;

  /** m³/min values are small, so metric airflow keeps two decimals. */
  get airflowFormat(): string { return this.isMetric ? '1.2-2' : '1.0-0'; }
}
