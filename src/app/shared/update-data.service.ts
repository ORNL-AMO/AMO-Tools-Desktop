import { Injectable } from '@angular/core';
import { Assessment } from './models/assessment';
import { Settings } from './models/settings';
import { SettingsService } from '../settings/settings.service';
declare const packageJson;

@Injectable()
export class UpdateDataService {

    constructor(private settingsService: SettingsService) { }

    checkAssessment(assessment: Assessment): Assessment {
        if(this.checkAssessmentVersionDifferent(assessment) == false){
            return assessment;
        }else{
            if(assessment.type == 'PSAT'){
                return this.updatePsat(assessment);
            }else if(assessment.type == 'PHAST'){
                return this.updatePhast(assessment);
            }
        }
    }

    checkAssessmentVersionDifferent(assessment: Assessment): boolean {
        if (assessment.appVersion != packageJson.version) {
            return true;
        } else {
            return false;
        }
    }


    updatePsat(assessment: Assessment): Assessment {
        //logic for updating psat data
        assessment.appVersion = packageJson.version;
        return assessment;
    }

    updatePhast(assessment: Assessment): Assessment {
        //logic for updating phast data
        assessment.appVersion = packageJson.version;
        return assessment;
    }

    checkSettingsVersionDifferent(settings: Settings): boolean {
        if (settings.appVersion != packageJson.version) {
            return true;
        } else {
            return false;
        }
    }

    checkSettings(settings: Settings): Settings{
        if(this.checkSettingsVersionDifferent(settings) == false){
            return settings
        }else {
            return this.updateSettings(settings);
        }
    }

    updateSettings(settings: Settings): Settings {
        settings = this.settingsService.setEnergyResultUnitSetting(settings);
        settings = this.settingsService.setTemperatureUnit(settings);
        settings.appVersion = packageJson.version;
        return settings;
    }
}