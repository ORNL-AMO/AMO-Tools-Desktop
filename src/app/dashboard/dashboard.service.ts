import { Injectable } from '@angular/core';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { DirectoryDbRef } from '../shared/models/directory';
import { Settings } from '../shared/models/settings';
declare const packageJson;
import { MockPhast, MockPhastSettings } from './mockPhast';
import { MockPsat, MockPsatCalculator, MockPsatSettings } from './mockPsat'; 
@Injectable()
export class DashboardService {

  constructor(private indexedDbService: IndexedDbService) { }

  createExamples(){
    MockPhast.directoryId = 2;
    this.indexedDbService.addAssessment(MockPhast);
    MockPsat.directoryId = 2;
    this.indexedDbService.addAssessment(MockPsat);
    MockPsatCalculator.assessmentId = 2;
    this.indexedDbService.addCalculator(MockPsatCalculator);
  }

  createDirectorySettings(){
    MockPhastSettings.directoryId = 1;
    MockPhastSettings.facilityInfo.date = new Date().toDateString();
    this.indexedDbService.addSettings(MockPhastSettings);
    MockPhastSettings.directoryId = 2;
    this.indexedDbService.addSettings(MockPhastSettings);
    delete MockPhastSettings.directoryId;
    MockPhastSettings.assessmentId = 1;
    this.indexedDbService.addSettings(MockPhastSettings);
    MockPsatSettings.assessmentId = 2;
    MockPsatSettings.facilityInfo.date = new Date().toDateString();
    this.indexedDbService.addSettings(MockPsatSettings);
  }

}
