import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WeatherApiService, WeatherStation } from '../../../weather-api.service';
import { WeatherFileParseResult, WeatherFileParserService } from './weather-file-parser.service';
import { ROUTE_TOKENS } from '../models/routes';
import { ConvertValue } from '../../../convert-units/ConvertValue';

@Component({
  selector: 'app-weather-file-import',
  templateUrl: './weather-file-import.component.html',
  styleUrls: ['./weather-file-import.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class WeatherFileImportComponent {
  private weatherApiService = inject(WeatherApiService);
  private weatherFileParserService = inject(WeatherFileParserService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  readonly columnSchemas = this.weatherFileParserService.columnSchemas;
  readonly timeColumnFormats = this.weatherFileParserService.timeColumnFormats;
  readonly xlsxEnabled = this.weatherFileParserService.xlsxEnabled;

  fileName: string | null = null;
  parseResult: WeatherFileParseResult | null = null;
  isProcessing = false;
  isDragOver = false;
  temperatureUnit: 'F' | 'C' = 'F';

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave() {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0];

    if (file) {
      this.processFile(file);
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (file) {
      this.processFile(file);
    }

    input.value = '';
  }

  continue() {
    if (!this.parseResult || this.hasErrors) {
      return;
    }

    // * mock station to satisfy station lookup api
    const fileImportStation: WeatherStation = {
      name: this.fileName ?? '',
      stationId: '',
      lat: 0,
      long: 0,
      beginDate: new Date(),
      endDate: new Date(),
      ratingPercent: 0,
      isTMYData: false
    };

    const weatherData = { ...this.weatherApiService.getWeatherData() };
    weatherData.selectedStation = fileImportStation;

    if (this.temperatureUnit === 'C') {
      const UnitConverter: ConvertValue = new ConvertValue(0, 'C', 'F');
      weatherData.weatherDataPoints = this.parseResult.dataPoints.map(p => {
        const convertedDryBulb = p.dry_bulb_temp != null ? UnitConverter.convertValue(p.dry_bulb_temp) : p.dry_bulb_temp;
        const convertedWetBulb = p.wet_bulb_temp != null ? UnitConverter.convertValue(p.wet_bulb_temp) : p.wet_bulb_temp;
        return {
          ...p,
          dry_bulb_temp: convertedDryBulb,
          wet_bulb_temp: convertedWetBulb,
        };
      });
    } else {
      weatherData.weatherDataPoints = this.parseResult.dataPoints;
    }

    weatherData.importedFileName = this.fileName;
    weatherData.addressString = null;
    this.weatherApiService.setWeatherData(weatherData);
    this.router.navigate([`../${ROUTE_TOKENS.annualStation}`], { relativeTo: this.activatedRoute });
  }

  private getFileError(file: File): string | null {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ext === 'csv' || (this.xlsxEnabled && ext === 'xlsx');
    if (!allowed) {
      const accepted = this.xlsxEnabled ? '.csv or .xlsx' : '.csv';
      return `Unsupported file type. Please upload a ${accepted} file.`;
    }
    if (file.size === 0) {
      return 'The selected file is empty.';
    }
    return null;
  }

  private async processFile(file: File) {
    const fileError = this.getFileError(file);
    if (fileError) {
      this.fileName = file.name;
      this.parseResult = { dataPoints: [], errors: [fileError], rowCount: 0, detectedColumns: [], timeLabel: null, previewRawRows: [] };
      this.cdr.markForCheck();
      return;
    }

    this.fileName = file.name;
    this.isProcessing = true;
    this.parseResult = null;
    this.temperatureUnit = 'F';
    this.cdr.markForCheck();

    try {
      this.parseResult = await this.weatherFileParserService.parseFile(file);
    } catch {
      this.parseResult = {
        dataPoints: [],
        errors: ['An unexpected error occurred while parsing the file.'],
        rowCount: 0,
        detectedColumns: [],
        timeLabel: null,
        previewRawRows: [],
      };
    }

    this.isProcessing = false;
    this.cdr.markForCheck();
  }

  get hasErrors(): boolean {
    return Boolean(this.parseResult?.errors?.length);
  }

  get displayedErrors() {
    return this.parseResult?.errors?.slice(0, 10) ?? [];
  }

  get additionalErrors(): number {
    const total = this.parseResult?.errors?.length ?? 0;
    return total > 10 ? total - 10 : 0;
  }
}
