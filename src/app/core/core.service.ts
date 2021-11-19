import { Injectable } from '@angular/core';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { Directory } from '../shared/models/directory';
import { Settings } from '../shared/models/settings';
import { MockPhast, MockPhastSettings } from '../examples/mockPhast';
import { MockPsat, MockPsatCalculator, MockPsatSettings } from '../examples/mockPsat';
import { MockFsat, MockFsatSettings, MockFsatCalculator } from '../examples/mockFsat';
import { MockSsmt, MockSsmtSettings } from '../examples/mockSsmt';
import { MockTreasureHunt, MockTreasureHuntSettings } from '../examples/mockTreasureHunt';
import { MockMotorInventory } from '../examples/mockMotorInventoryData';
import { BehaviorSubject } from 'rxjs';
import { MockWasteWater, MockWasteWaterSettings } from '../examples/mockWasteWater';
import { MockCompressedAirAssessment, MockCompressedAirAssessmentSettings } from '../examples/mockCompressedAirAssessment';
@Injectable()
export class CoreService {

  showTranslateModal: BehaviorSubject<boolean>;

  exampleDirectoryId: number;
  examplePhastId: number;
  examplePsatId: number;
  exampleFsatId: number;
  exampleSsmtId: number;
  exampleWasteWaterId: number;
  exampleTreasureHuntId: number;
  exampleMotorInventoryId: number;
  exampleCompressedAirAssessmentId: number;
  constructor(private indexedDbService: IndexedDbService) {
    this.showTranslateModal = new BehaviorSubject<boolean>(false);
  }

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
                    this.exampleTreasureHuntId = tHuntId;

                    MockMotorInventory.directoryId = this.exampleDirectoryId;
                    this.indexedDbService.addInventoryItem(MockMotorInventory).then(inventoryId => {
                      this.exampleMotorInventoryId = inventoryId;

                      MockWasteWater.directoryId = this.exampleDirectoryId;
                      this.indexedDbService.addAssessment(MockWasteWater).then(wwId => {
                        this.exampleWasteWaterId = wwId;
                        MockCompressedAirAssessment.directoryId = this.exampleDirectoryId;
                        this.indexedDbService.addAssessment(MockCompressedAirAssessment).then(compressedAirAssessmentId => {
                          this.exampleCompressedAirAssessmentId = compressedAirAssessmentId;
                          resolve(true);
                        })
                      });
                    });
                  });
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

                    delete MockPsatSettings.assessmentId;
                    MockPsatSettings.inventoryId = this.exampleMotorInventoryId;
                    this.indexedDbService.addSettings(MockPsatSettings).then(() => {

                      MockWasteWaterSettings.assessmentId = this.exampleWasteWaterId;
                      this.indexedDbService.addSettings(MockWasteWaterSettings).then(() => {
                        MockCompressedAirAssessmentSettings.assessmentId = this.exampleCompressedAirAssessmentId;
                        this.indexedDbService.addSettings(MockCompressedAirAssessmentSettings).then(() => {
                          resolve(true);
                        })
                      });
                    });
                  });
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
