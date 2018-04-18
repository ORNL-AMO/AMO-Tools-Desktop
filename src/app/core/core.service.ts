import { Injectable } from '@angular/core';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { DirectoryDbRef } from '../shared/models/directory';
import { Settings } from '../shared/models/settings';
declare const packageJson;
import { MockPhast, MockPhastSettings } from './mockPhast';
import { MockPsat, MockPsatCalculator, MockPsatSettings } from './mockPsat';

@Injectable()
export class CoreService {

  constructor(private indexedDbService: IndexedDbService) { }

  createExamples(): Promise<any> {
    return new Promise((resolve, reject) => {
      MockPhast.directoryId = 2;
      this.indexedDbService.addAssessment(MockPhast).then(() => {
        MockPsat.directoryId = 2;
        this.indexedDbService.addAssessment(MockPsat).then(() => {
          MockPsatCalculator.assessmentId = 2;
          this.indexedDbService.addCalculator(MockPsatCalculator).then(() => {
            resolve(true);
          });
        });
      });
    })
  }

  createDirectorySettings(): Promise<any> {
    return new Promise((resolve, reject) => {
      MockPhastSettings.directoryId = 1;
      MockPhastSettings.facilityInfo.date = new Date().toDateString();
      this.indexedDbService.addSettings(MockPhastSettings).then(() => {
        MockPhastSettings.directoryId = 2;
        this.indexedDbService.addSettings(MockPhastSettings).then(() => {
          delete MockPhastSettings.directoryId;
          MockPhastSettings.assessmentId = 1;
          this.indexedDbService.addSettings(MockPhastSettings).then(() => {
            MockPsatSettings.assessmentId = 2;
            MockPsatSettings.facilityInfo.date = new Date().toDateString();
            this.indexedDbService.addSettings(MockPsatSettings).then(() => {
              resolve(true);
            });
          });
        });
      });
    })
  }

  createDirectory(): Promise<any> {
    return new Promise((resolve, reject) => {
      let tmpDirectory: DirectoryDbRef = {
        name: 'All Assessments',
        createdDate: new Date(),
        modifiedDate: new Date(),
        parentDirectoryId: null,
      }
      this.indexedDbService.addDirectory(tmpDirectory).then(
        results => {
          tmpDirectory.parentDirectoryId = results;
          tmpDirectory.name = 'Examples';
          this.indexedDbService.addDirectory(tmpDirectory).then(() => {
            resolve(true);
          })
        })
    })
  }
}
