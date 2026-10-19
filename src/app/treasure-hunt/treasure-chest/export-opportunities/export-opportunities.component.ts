import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { TreasureHunt, ImportExportOpportunities, TreasureHuntOpportunity, OpportunitySheet, AssessmentOpportunity } from '../../../shared/models/treasure-hunt';
import * as _ from 'lodash';
import { ImportExportService } from '../../../shared/import-export/import-export.service';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { TreasureChestMenuService } from '../treasure-chest-menu/treasure-chest-menu.service';
import { EmailMeasurDataService } from '../../../shared/email-measur-data/email-measur-data.service';
import { ExportOpportunitiesService } from '../export-opportunities.service';

interface ExportPreviewSection {
  label: string;
  key: Exclude<keyof ImportExportOpportunities, 'origin'>;
  fallbackName: string;
  usesItemName?: boolean;
}

@Component({
    selector: 'app-export-opportunities',
    templateUrl: './export-opportunities.component.html',
    styleUrls: ['./export-opportunities.component.css'],
    standalone: false
})
export class ExportOpportunitiesComponent implements OnInit {
  @ViewChild('exportModal', { static: false }) public exportModal: ModalDirective;

  treasureHunt: TreasureHunt;
  treasureHuntSub: Subscription;
  exportName: string = 'Opportunites Data';
  includeUnselected: boolean = false;
  hasUnselectedOpportunities: boolean = false;
  previewSections: Array<ExportPreviewSection> = [
    { label: 'Lighting Replacements', key: 'lightingReplacements', fallbackName: 'Lighting Replacement' },
    { label: 'Motor Replacements', key: 'replaceExistingMotors', fallbackName: 'Replace Motor' },
    { label: 'Upgrade Motor Drives', key: 'motorDrives', fallbackName: 'Motor Drive' },
    { label: 'Natural Gas Reductions', key: 'naturalGasReductions', fallbackName: 'Natural Gas Reduction' },
    { label: 'Electricity Reductions', key: 'electricityReductions', fallbackName: 'Electricity Reduction' },
    { label: 'Compressed Air Reductions', key: 'compressedAirReductions', fallbackName: 'Compressed Air Reduction' },
    { label: 'Compressed Air Pressure Reductions', key: 'compressedAirPressureReductions', fallbackName: 'Compressed Air Pressure Reduction' },
    { label: 'Water Reductions', key: 'waterReductions', fallbackName: 'Water Reduction' },
    { label: 'Steam Reductions', key: 'steamReductions', fallbackName: 'Steam Reduction' },
    { label: 'Pipe Insulations', key: 'pipeInsulationReductions', fallbackName: 'Pipe Insulation' },
    { label: 'Tank Insulations', key: 'tankInsulationReductions', fallbackName: 'Tank Insulation' },
    { label: 'Air Leak Surveys', key: 'airLeakSurveys', fallbackName: 'Air Leak Survey' },
    { label: 'Steam Leak Surveys', key: 'steamLeakSurveys', fallbackName: 'Steam Leak Survey' },
    { label: 'Opening Losses', key: 'openingLosses', fallbackName: 'Opening Loss' },
    { label: 'Wall Losses', key: 'wallLosses', fallbackName: 'Wall Loss' },
    { label: 'Leakage Losses', key: 'leakageLosses', fallbackName: 'Leakage Loss' },
    { label: 'Air Heating Opportunities', key: 'airHeatingOpportunities', fallbackName: 'Air Heating' },
    { label: 'Flue Gas Losses', key: 'flueGasLosses', fallbackName: 'Flue Gas Loss' },
    { label: 'Waste Heat', key: 'wasteHeatReductions', fallbackName: 'Waste Heat Reduction' },
    { label: 'Heat Cascading', key: 'heatCascadingOpportunities', fallbackName: 'Heat Cascading' },
    { label: 'Water Heating', key: 'waterHeatingOpportunities', fallbackName: 'Water Heating' },
    { label: 'Boiler Blowdown Rate', key: 'boilerBlowdownRateOpportunities', fallbackName: 'Boiler Blowdown Rate' },
    { label: 'Cooling Tower Makeup Water', key: 'coolingTowerMakeupOpportunities', fallbackName: 'Cooling Tower Makeup Water' },
    { label: 'Chiller Staging', key: 'chillerStagingOpportunities', fallbackName: 'Chiller Staging' },
    { label: 'Chiller Performance', key: 'chillerPerformanceOpportunities', fallbackName: 'Chiller Performance' },
    { label: 'Cooling Tower Fan', key: 'coolingTowerFanOpportunities', fallbackName: 'Cooling Tower Fan' },
    { label: 'Cooling Tower Basin', key: 'coolingTowerBasinOpportunities', fallbackName: 'Cooling Tower Basin' },
    { label: 'Power Factor Correction', key: 'powerFactorCorrectionOpportunities', fallbackName: 'Power Factor Correction' },
    { label: 'Opportunity Sheets', key: 'opportunitySheets', fallbackName: 'Opportunity Sheet', usesItemName: true },
    { label: 'Assessment Opportunities', key: 'assessmentOpportunities', fallbackName: 'Assessment Opportunity', usesItemName: true }
  ];
  constructor(private importExportService: ImportExportService, 
    private treasureHuntService: TreasureHuntService,
    private treasureChestMenuService: TreasureChestMenuService,
    private emailMeasurDataService: EmailMeasurDataService,
    private exportOpportunitiesService: ExportOpportunitiesService
  ) { }

  ngOnInit() {
    this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
      this.treasureHunt = val;
      this.hasUnselectedOpportunities = this.previewSections.some(section => {
        const opportunities: Array<TreasureHuntOpportunity> = this.treasureHunt?.[section.key];
        return opportunities?.some(opportunity => !opportunity.selected);
      });
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
  }

  onExportModalHidden() {
    this.treasureChestMenuService.showExportModal.next(false);
  }

  getOpportunityName(section: ExportPreviewSection, opportunity: TreasureHuntOpportunity, index: number): string {
    const name: string = section.usesItemName ? (opportunity as OpportunitySheet | AssessmentOpportunity).name : opportunity.opportunitySheet?.name;
    return name || `${section.fallbackName} #${index + 1}`;
  }

  exportData() {
    const exportOpportunities: ImportExportOpportunities = this.exportOpportunitiesService.setImportExportData(this.treasureHunt, this.includeUnselected);
    this.importExportService.downloadOpportunities(exportOpportunities, this.exportName);
    this.hideExportModal();
  }

  showEmailMeasurDataModal() {
    this.emailMeasurDataService.measurItemAttachment = {
      itemType: 'opportunities',
      itemName: '',
      itemData: ''
    }
    this.emailMeasurDataService.showEmailMeasurDataModal.next(true);
    this.hideExportModal();
  }
}
