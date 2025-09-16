import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { TreasureHunt, ImportExportOpportunities, TreasureHuntOpportunity } from '../../../shared/models/treasure-hunt';
import * as _ from 'lodash';
import { ImportExportService } from '../../../shared/import-export/import-export.service';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { TreasureChestMenuService } from '../treasure-chest-menu/treasure-chest-menu.service';
@Component({
    selector: 'app-export-opportunities',
    templateUrl: './export-opportunities.component.html',
    styleUrls: ['./export-opportunities.component.css'],
    standalone: false
})
export class ExportOpportunitiesComponent implements OnInit {
  @ViewChild('exportModal', { static: false }) public exportModal: ModalDirective;

  exportOpportunities: ImportExportOpportunities;
  treasureHunt: TreasureHunt;
  treasureHuntSub: Subscription;
  exportName: string = 'Opportunites Data';
  constructor(private importExportService: ImportExportService, private treasureHuntService: TreasureHuntService,
    private treasureChestMenuService: TreasureChestMenuService) { }

  ngOnInit() {
    this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
      this.treasureHunt = val;
      this.setImportExportData();
    });
  }

  ngOnDestroy() {
    this.treasureHuntSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.showExportModal();
  }

  showExportModal() {
    this.exportModal.show();
  }

  hideExportModal() {
    this.exportModal.hide();
    this.exportModal.onHidden.subscribe(val => {
      this.treasureChestMenuService.showExportModal.next(false);
    });
  }
  setImportExportData() {
    this.exportOpportunities = {
      lightingReplacements: this.getSelectedOpportunitiesGeneric(this.treasureHunt.lightingReplacements),
      opportunitySheets: this.getSelectedOpportunitiesGeneric(this.treasureHunt.opportunitySheets),
      assessmentOpportunities: this.getSelectedOpportunitiesGeneric(this.treasureHunt.assessmentOpportunities),
      replaceExistingMotors: this.getSelectedOpportunitiesGeneric(this.treasureHunt.replaceExistingMotors),
      motorDrives: this.getSelectedOpportunitiesGeneric(this.treasureHunt.motorDrives),
      naturalGasReductions: this.getSelectedOpportunitiesGeneric(this.treasureHunt.naturalGasReductions),
      electricityReductions: this.getSelectedOpportunitiesGeneric(this.treasureHunt.electricityReductions),
      compressedAirReductions: this.getSelectedOpportunitiesGeneric(this.treasureHunt.compressedAirReductions),
      compressedAirPressureReductions: this.getSelectedOpportunitiesGeneric(this.treasureHunt.compressedAirPressureReductions),
      steamReductions: this.getSelectedOpportunitiesGeneric(this.treasureHunt.steamReductions),
      waterReductions: this.getSelectedOpportunitiesGeneric(this.treasureHunt.waterReductions),
      pipeInsulationReductions: this.getSelectedOpportunitiesGeneric(this.treasureHunt.pipeInsulationReductions),
      tankInsulationReductions: this.getSelectedOpportunitiesGeneric(this.treasureHunt.tankInsulationReductions),
      airLeakSurveys: this.getSelectedOpportunitiesGeneric(this.treasureHunt.airLeakSurveys),
      airHeatingOpportunities: this.getSelectedOpportunitiesGeneric(this.treasureHunt.airHeatingOpportunities),
      openingLosses: this.getSelectedOpportunitiesGeneric(this.treasureHunt.openingLosses),
      wallLosses: this.getSelectedOpportunitiesGeneric(this.treasureHunt.wallLosses),
      leakageLosses: this.getSelectedOpportunitiesGeneric(this.treasureHunt.leakageLosses),
      flueGasLosses: this.getSelectedOpportunitiesGeneric(this.treasureHunt.flueGasLosses),
      wasteHeatReductions: this.getSelectedOpportunitiesGeneric(this.treasureHunt.wasteHeatReductions),
      heatCascadingOpportunities: this.getSelectedOpportunitiesGeneric(this.treasureHunt.heatCascadingOpportunities),
      waterHeatingOpportunities: this.getSelectedOpportunitiesGeneric(this.treasureHunt.waterHeatingOpportunities),
      coolingTowerMakeupOpportunities: this.getSelectedOpportunitiesGeneric(this.treasureHunt.coolingTowerMakeupOpportunities),
      chillerStagingOpportunities: this.getSelectedOpportunitiesGeneric(this.treasureHunt.chillerStagingOpportunities),
      chillerPerformanceOpportunities: this.getSelectedOpportunitiesGeneric(this.treasureHunt.chillerPerformanceOpportunities),
      coolingTowerFanOpportunities: this.getSelectedOpportunitiesGeneric(this.treasureHunt.coolingTowerFanOpportunities),
      coolingTowerBasinOpportunities: this.getSelectedOpportunitiesGeneric(this.treasureHunt.coolingTowerBasinOpportunities),
      boilerBlowdownRateOpportunities: this.getSelectedOpportunitiesGeneric(this.treasureHunt.boilerBlowdownRateOpportunities),
      powerFactorCorrectionOpportunities: this.getSelectedOpportunitiesGeneric(this.treasureHunt.powerFactorCorrectionOpportunities)
    }
  }

  private getSelectedOpportunitiesGeneric<T extends TreasureHuntOpportunity>(opportunities: Array<T>): Array<T> | undefined {
    if (opportunities && opportunities.length > 0) {
      return _.filter(opportunities, (opportunity) => opportunity.selected);
    }
    return undefined;
  }

  exportData() {
    this.importExportService.downloadOpportunities(this.exportOpportunities, this.exportName);
    this.hideExportModal();
  }
}
