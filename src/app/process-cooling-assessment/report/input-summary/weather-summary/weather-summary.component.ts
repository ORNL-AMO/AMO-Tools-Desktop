import { Component, ViewChild } from '@angular/core';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { ProcessCoolingAssessmentService } from '../../../services/process-cooling-assessment.service';
import { InputSummarySection } from '../../report-ui-models';
import { WeatherContextData } from '../../../../shared/modules/weather-data/weather-context.token';
import { InputSummaryTableComponent } from '../input-summary-table/input-summary-table.component';

@Component({
    selector: 'app-weather-summary',
    templateUrl: './weather-summary.component.html',
    standalone: false
})
export class WeatherSummaryComponent {
    private readonly assessmentService = inject(ProcessCoolingAssessmentService);

    @ViewChild(InputSummaryTableComponent) inputSummaryTable: InputSummaryTableComponent;
    copyTableString: string;
    collapse: boolean = true;

    sections$ = this.assessmentService.processCooling$.pipe(
        map(pc => this.buildSections(pc?.weatherData))
    );

    toggleCollapse() {
        this.collapse = !this.collapse;
    }

    updateCopyTableString() {
        this.copyTableString = this.inputSummaryTable?.tableEl?.nativeElement?.innerText;
    }

    private buildSections(weatherData: WeatherContextData | undefined): InputSummarySection[] {
        return [{
            label: 'Weather Data',
            rows: [
                { label: 'Location',      units: '', className: 'default', baseline: { value: weatherData?.addressString ?? null }, modifications: [] },
                { label: 'Station Name',  units: '', className: 'default', baseline: { value: weatherData?.selectedStation?.name ?? null }, modifications: [] },
                { label: 'Station ID',    units: '', className: 'default', baseline: { value: weatherData?.selectedStation?.stationId ?? null }, modifications: [] },
                { label: 'State',         units: '', className: 'default', baseline: { value: weatherData?.selectedStation?.state ?? null }, modifications: [] },
                { label: 'Distance',      units: 'miles', className: 'default', baseline: { value: weatherData?.selectedStation?.distance ?? null, decimalPipe: '1.1-1' }, modifications: [] },
                { label: 'Data Quality Rating', units: '%', className: 'default', baseline: { value: weatherData?.selectedStation?.ratingPercent ?? null, decimalPipe: '1.0-0' }, modifications: [] },
            ]
        }];
    }
}
