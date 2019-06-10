import { Injectable } from '@angular/core';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { DirectoryDbRef, Directory } from '../shared/models/directory';
import { Settings } from '../shared/models/settings';
declare const packageJson;
import { MockPhast, MockPhastSettings } from './mockPhast';
import { MockPsat, MockPsatCalculator, MockPsatSettings } from './mockPsat';
import { MockFsat, MockFsatSettings, MockFsatCalculator } from './mockFsat';
import { MockSsmt, MockSsmtSettings } from './mockSsmt';
import { MockTreasureHunt, MockTreasureHuntSettings } from './mockTreasureHunt';
@Injectable()
export class CoreService {

  exampleDirectoryId: number;
  examplePhastId: number;
  examplePsatId: number;
  exampleFsatId: number;
  exampleSsmtId: number;
  exampleTreasureHuntId: number;
  constructor(private indexedDbService: IndexedDbService) { }

  createExamples(): Promise<any> {
    return new Promise((resolve, reject) => {
      MockPhast.directoryId = this.exampleDirectoryId;
      this.indexedDbService.addAssessment(MockPhast).then(phastId => {

        this.examplePhastId = phastId;
        MockPsat.directoryId = this.exampleDirectoryId;
        this.indexedDbService.addAssessment(MockPsat).then(psatId => {

          this.examplePsatId = psatId;
          MockPsatCalculator.assessmentId = this.examplePsatId;

          this.indexedDbService.addCalculator(MockPsatCalculator).then(() => {

            MockFsat.directoryId = this.exampleDirectoryId;
            this.indexedDbService.addAssessment(MockFsat).then(fsatId => {
              this.exampleFsatId = fsatId;
              MockFsatCalculator.assessmentId = fsatId;

              this.indexedDbService.addCalculator(MockFsatCalculator).then(() => {

                MockSsmt.directoryId = this.exampleDirectoryId;
                this.indexedDbService.addAssessment(MockSsmt).then(ssmtId => {
                  this.exampleSsmtId = ssmtId;

                  MockTreasureHunt.directoryId = this.exampleDirectoryId;
                  this.indexedDbService.addAssessment(MockTreasureHunt).then(tHuntId => {
                    console.log('added treasure hunt')
                    this.exampleTreasureHuntId = tHuntId;
                    resolve(true);
                  })
                });
              });
            });
          });
        });
      });
    });
  }

  createDirectorySettings(): Promise<any> {
    return new Promise((resolve, reject) => {
      let tmpSettings: Settings = JSON.parse(JSON.stringify(MockPhastSettings));
      tmpSettings.directoryId = 1;
      delete tmpSettings.facilityInfo;
      this.indexedDbService.addSettings(tmpSettings).then(() => {

        MockPhastSettings.facilityInfo.date = new Date().toDateString();
        MockPhastSettings.directoryId = this.exampleDirectoryId;
        this.indexedDbService.addSettings(MockPhastSettings).then(() => {

          delete MockPhastSettings.directoryId;
          MockPhastSettings.assessmentId = this.examplePhastId;

          this.indexedDbService.addSettings(MockPhastSettings).then(() => {

            MockPsatSettings.assessmentId = this.examplePsatId;

            MockPsatSettings.facilityInfo.date = new Date().toDateString();
            this.indexedDbService.addSettings(MockPsatSettings).then(() => {

              MockFsatSettings.assessmentId = this.exampleFsatId;

              MockFsatSettings.facilityInfo.date = new Date().toDateString();
              this.indexedDbService.addSettings(MockFsatSettings).then(() => {

                MockSsmtSettings.assessmentId = this.exampleSsmtId;

                this.indexedDbService.addSettings(MockSsmtSettings).then(() => {
                  
                  MockTreasureHuntSettings.assessmentId = this.exampleTreasureHuntId;
                  this.indexedDbService.addSettings(MockTreasureHuntSettings).then(() => {
                    resolve(true);
                  })
                });
              });
            });
          });
        });
      });
    });
  }

  createDirectory(): Promise<any> {
    return new Promise((resolve, reject) => {
      let tmpDirectory: Directory = {
        name: 'All Assessments',
        createdDate: new Date(),
        modifiedDate: new Date(),
        parentDirectoryId: null,
      };
      this.indexedDbService.addDirectory(tmpDirectory).then(
        results => {
          tmpDirectory.parentDirectoryId = results;
          tmpDirectory.name = 'Examples';
          tmpDirectory.isExample = true;
          this.indexedDbService.addDirectory(tmpDirectory).then(dirId => {
            this.exampleDirectoryId = dirId;
            resolve(true);
          });
        });
    });
  }
}
