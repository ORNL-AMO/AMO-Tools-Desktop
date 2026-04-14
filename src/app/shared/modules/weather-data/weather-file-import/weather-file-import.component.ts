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
    weatherData.weatherDataPoints = this.temperatureUnit === 'C'
      ? this.parseResult.dataPoints.map(p => ({
          ...p,
          dry_bulb_temp: p.dry_bulb_temp != null ? new ConvertValue(p.dry_bulb_temp, 'C', 'F').convertedValue : p.dry_bulb_temp,
          wet_bulb_temp: p.wet_bulb_temp != null ? new ConvertValue(p.wet_bulb_temp, 'C', 'F').convertedValue : p.wet_bulb_temp,
        }))
      : this.parseResult.dataPoints;
    weatherData.importedFileName = this.fileName;
    weatherData.addressString = null;
    this.weatherApiService.setWeatherData(weatherData);
    this.router.navigate([`../${ROUTE_TOKENS.annualStation}`], { relativeTo: this.activatedRoute });
  }

  private getFileError(file: File): string | null {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx') {
      return 'Unsupported file type. Please upload a .csv or .xlsx file.';
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
