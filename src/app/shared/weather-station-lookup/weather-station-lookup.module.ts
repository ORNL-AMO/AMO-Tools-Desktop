import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherStationLookupComponent } from './weather-station-lookup.component';
import { WeatherStationLookupService } from './weather-station-lookup.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';



@NgModule({
    declarations: [
        WeatherStationLookupComponent
    ],
    exports: [
        WeatherStationLookupComponent
    ],
    imports: [
        CommonModule,
        FormsModule
    ],
    providers: [
        WeatherStationLookupService,
        provideHttpClient(withInterceptorsFromDi())
    ]
})
export class WeatherStationLookupModule { }
