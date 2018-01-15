import { Injectable } from '@angular/core';
import { Assessment } from './models/assessment';
import { Settings } from './models/settings';
import { SettingsService } from '../settings/settings.service';
declare const packageJson;

@Injectable()
export class UpdateDataService {

    constructor(private settingsService: SettingsService) { }

    checkAssessmentVersionDifferent(assessment: Assessment): boolean {
        if (assessment.appVersion != packageJson.version) {
            return true;
        } else {
            return false;
        }
    }


    updatePsat(assessment: Assessment): Assessment {
        //logic for updating psat data
        return assessment;
    }

    updatePhast(assessment: Assessment): Assessment {
        //logic for updating phast data
        return assessment;
    }

    checkSettingsVersionDifferent(settings: Settings): boolean {
        if (settings.appVersion != packageJson.version) {
            return true;
        } else {
            return false;
        }
    }

    updateSettings(settings: Settings): Settings {
        settings = this.settingsService.setEnergyResultUnitSetting(settings);
        settings = this.settingsService.setTemperatureUnit(settings);
        return settings;
    }
}