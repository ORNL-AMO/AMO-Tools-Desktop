import { Injectable } from '@angular/core';
import { Settings } from '../shared/models/settings';
import { IndexedDbService } from './indexed-db.service';
import * as _ from 'lodash';
@Injectable()
export class SettingsDbService {
  allSettings: Array<Settings>;
  constructor(private indexedDbService: IndexedDbService) { }

  setAll(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.indexedDbService.getAllSettings().then(settings => {
        this.allSettings = settings;
        resolve(true)
      })
    })
  }

  getAll(): Array<Settings> {
    return this.allSettings;
  }

  getById(id: number): Settings {
    let selectedSettings: Settings = _.find(this.allSettings, (settings) => { return settings.id == id })
    return selectedSettings;
  }

  getByDirectoryId(id: number): Settings {
    let selectedSettings: Settings = _.find(this.allSettings, (settings) => { return settings.directoryId == id });
    return selectedSettings;
  }

  getByAssessmentId(id: number): Settings {
    let selectedSettings: Settings = _.find(this.allSettings, (settings) => { return settings.assessmentId == id });
    return selectedSettings;
  }


}
