import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { TreasureHunt, ImportExportOpportunities } from '../../../shared/models/treasure-hunt';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { ImportOpportunitiesService } from '../import-opportunities.service';
import { OpportunityCardsService } from '../opportunity-cards/opportunity-cards.service';
import { TreasureChestMenuService } from '../treasure-chest-menu/treasure-chest-menu.service';
import { FileImportStatus, ImportService } from '../../../shared/import-export/import.service';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';

@Component({
    selector: 'app-import-opportunities',
    templateUrl: './import-opportunities.component.html',
    styleUrls: ['./import-opportunities.component.css'],
    standalone: false
})
export class ImportOpportunitiesComponent implements OnInit {

  @ViewChild('importModal', { static: false }) public importModal: ModalDirective;

  importInProgress: boolean = false;
  fileReference: any;
  fileImportStatus: FileImportStatus;
  importJson: any = null;
  treasureHuntSub: Subscription;
  treasureHunt: TreasureHunt;
  constructor(private treasureHuntService: TreasureHuntService,
    private importOpportunitiesService: ImportOpportunitiesService, private opportunityCardsService: OpportunityCardsService,
    private importService: ImportService,
    private treasureChestMenuService: TreasureChestMenuService) { }

 ngOnInit() {
   this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
     this.treasureHunt = val;
   });
  }

  ngOnDestroy(){
    this.treasureHuntSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.showImportModal();
  }

  showImportModal() {
    this.importModal.show();
  }

  hideImportModal() {
    this.importModal.hide();
    this.importModal.onHidden.subscribe(val => {
      this.treasureChestMenuService.showImportModal.next(false);
    });
  }

  async setImportFile($event) {
    if ($event.target.files && $event.target.files.length !== 0) {
      let jsonRegex = /.json$/;
      this.fileReference = $event;
      if (jsonRegex.test($event.target.files[0].name)) {
        const fileContent = await this.importService.readFileAsText($event.target.files[0]);
        this.importJson = JSON.parse(fileContent);

        this.fileImportStatus = this.importService.getIsValidImportType(this.importJson, 'AMO-TOOLS-DESKTOP-OPPORTUNITIES');

        if (this.fileImportStatus.fileType === 'AMO-TOOLS-DESKTOP') {
          this.patchTreasureHuntAssessmentOpportunities();
          this.fileImportStatus = {
            fileType: 'AMO-TOOLS-DESKTOP-OPPORTUNITIES',
            isValid: true
          };
        }
      } else {
        this.fileImportStatus = {
          fileType: 'UNKNOWN',
          isValid: false
        };
      }
    }
  }

  patchTreasureHuntAssessmentOpportunities() {
    if (this.importJson?.assessments?.length === 1) {
      const {assessment, settings}: {assessment: Assessment, settings: Settings} = this.importJson.assessments[0];
      if (assessment.type === 'TreasureHunt' && assessment.treasureHunt) {
        const importExportOpportunities: ImportExportOpportunities = {
          lightingReplacements: assessment.treasureHunt.lightingReplacements,
          opportunitySheets: assessment.treasureHunt.opportunitySheets,
          assessmentOpportunities: assessment.treasureHunt.assessmentOpportunities,
          replaceExistingMotors: assessment.treasureHunt.replaceExistingMotors,
          motorDrives: assessment.treasureHunt.motorDrives,
          naturalGasReductions: assessment.treasureHunt.naturalGasReductions,
          electricityReductions: assessment.treasureHunt.electricityReductions,
          compressedAirReductions: assessment.treasureHunt.compressedAirReductions,
          waterReductions: assessment.treasureHunt.waterReductions,
          compressedAirPressureReductions: assessment.treasureHunt.compressedAirPressureReductions,
          steamReductions: assessment.treasureHunt.steamReductions,
          pipeInsulationReductions: assessment.treasureHunt.pipeInsulationReductions,
          tankInsulationReductions: assessment.treasureHunt.tankInsulationReductions,
          airLeakSurveys: assessment.treasureHunt.airLeakSurveys,
          openingLosses: assessment.treasureHunt.openingLosses,
          airHeatingOpportunities: assessment.treasureHunt.airHeatingOpportunities,
          wallLosses: assessment.treasureHunt.wallLosses,
          leakageLosses: assessment.treasureHunt.leakageLosses,
          flueGasLosses: assessment.treasureHunt.flueGasLosses,
          wasteHeatReductions: assessment.treasureHunt.wasteHeatReductions,
          heatCascadingOpportunities: assessment.treasureHunt.heatCascadingOpportunities,
          waterHeatingOpportunities: assessment.treasureHunt.waterHeatingOpportunities,
          coolingTowerMakeupOpportunities: assessment.treasureHunt.coolingTowerMakeupOpportunities,
          chillerStagingOpportunities: assessment.treasureHunt.chillerStagingOpportunities,
          chillerPerformanceOpportunities: assessment.treasureHunt.chillerPerformanceOpportunities,
          coolingTowerFanOpportunities: assessment.treasureHunt.coolingTowerFanOpportunities,
          coolingTowerBasinOpportunities: assessment.treasureHunt.coolingTowerBasinOpportunities,
          boilerBlowdownRateOpportunities: assessment.treasureHunt.boilerBlowdownRateOpportunities,
          powerFactorCorrectionOpportunities: assessment.treasureHunt.powerFactorCorrectionOpportunities
        };
        this.importJson = importExportOpportunities;
      }
    }

  }

  importFile() {
    let importData = this.importJson;
    this.treasureHunt = this.importOpportunitiesService.importData(importData, this.treasureHunt);
    this.treasureHuntService.treasureHunt.next(this.treasureHunt);
    this.opportunityCardsService.updateOpportunityCards.next(true);
    this.hideImportModal();
  }
}
