import { Injectable } from '@angular/core';
import { Assessment, AssessmentType } from '../models/assessment';
import { EnergyUseItem } from '../models/treasure-hunt';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import * as _ from 'lodash';
import { AssessmentOption } from '../connected-inventory/integrations';
import { PsatService } from '../../psat/psat.service';
import { Settings } from '../models/settings';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { FsatService } from '../../fsat/fsat.service';
import { PhastIntegrationService } from '../../phast/phast-integration.service';
import { AssessmentService } from '../../dashboard/assessment.service';
import { CompressedAirAssessmentResultsService } from '../../compressed-air-assessment/compressed-air-assessment-results.service';
import { phastModuleFor, toLegacyPhastAssessment } from '../../process-heating-assessment/services/legacy-phast-assessment.util';

@Injectable({
  providedIn: 'root'
})
export class AssessmentIntegrationService {
  assessmentsByType: Assessment[];
  constructor(private assessmentDbService: AssessmentDbService,
    private assessmentService: AssessmentService,
    private router: Router, 
    private settingsDbService: SettingsDbService,
    private psatService: PsatService,
    private fsatService: FsatService,
    private phastIntegrationService: PhastIntegrationService,
    private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService,
    ) { }

  async getExistingIntegratedAssessment(existingIntegrationData: ExistingIntegrationData) {
    let allAssessments: Array<Assessment> = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    this.assessmentDbService.setAll(allAssessments);
    this.assessmentsByType = allAssessments.filter(assessment => { return assessment.type == existingIntegrationData.assessmentType });
    let assessment = this.assessmentsByType.find(assessment => {assessment.id === existingIntegrationData.assessmentId});
    return assessment;
  }

  async setIntegratedAssessment(integratedAssessmentId: number, assessmentType: AssessmentType, treasureHuntSettings: Settings): Promise<IntegratedAssessment> {
    let allAssessments: Array<Assessment> = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    this.assessmentDbService.setAll(allAssessments);
    let assessment: Assessment = allAssessments.find(assessment => assessment.id === integratedAssessmentId);
    let integratedAssessment: IntegratedAssessment = {
      assessment: undefined,
      name: undefined,
      assessmentType: assessmentType,
      selectedModificationId: undefined,
    }

    if (assessment) {
      let assessmentSettings: Settings = this.settingsDbService.getByAssessmentId(assessment);
      integratedAssessment.assessment = assessmentType === 'PHAST' ? toLegacyPhastAssessment(assessment, assessmentSettings) : assessment;
      if (assessmentType === 'PHAST') {
        if (integratedAssessment.assessment.phast.setupDone) {
          await this.phastIntegrationService.setIntegratedAssessmentData(integratedAssessment, assessmentSettings, treasureHuntSettings);
        }
        integratedAssessment.navigation = { queryParams: undefined, url: `/${phastModuleFor(assessment.phast)}/${assessment.id}` };
      } else if (assessmentType === 'PSAT') {
        this.psatService.setIntegratedAssessmentData(integratedAssessment, assessmentSettings);
      } else if (assessmentType === 'FSAT') {
        this.fsatService.setIntegratedAssessmentData(integratedAssessment, assessmentSettings);
      } else if (assessmentType === 'CompressedAir') {
        this.compressedAirAssessmentResultsService.setIntegratedAssessmentData(integratedAssessment, assessmentSettings);
      } else if (assessmentType === 'SSMT') {
      } else if (assessmentType === 'WasteWater') {
      } 
    }

    return integratedAssessment;
  }

  checkHasUpdatedEnergyData(existingOptions: IntegratedEnergyOptions, updatedOptions: IntegratedEnergyOptions) {
    let hasUpdatedBaseline = this.checkisOptionDifferent(existingOptions.baseline, updatedOptions.baseline);
    let existingMod = existingOptions.modifications[0];
    if (!existingMod) {
      return hasUpdatedBaseline;
    }
    // The linked modification can be deleted, or left out for using another energy source, after it was linked.
    let updatedMod = updatedOptions.modifications.find(mod => mod.modificationId === existingMod.modificationId);
    let hasUpdatedModification: boolean = !updatedMod || this.checkisOptionDifferent(existingMod, updatedMod);
    return hasUpdatedBaseline || hasUpdatedModification;
  }

  checkisOptionDifferent(existingOption: AssessmentEnergyOption, updatedOption: AssessmentEnergyOption) {
    let isEnergyDifferent: boolean = existingOption.annualEnergy !== updatedOption.annualEnergy;
    let isCostDifferent: boolean = existingOption.annualCost !== updatedOption.annualCost;
    let isCo2Different: boolean = existingOption.co2EmissionsOutput !== updatedOption.co2EmissionsOutput;
    let differs: boolean = isEnergyDifferent || isCo2Different || isCostDifferent;
    return differs;
  }

  async getAssessmentOptionsByType(assessmentType: AssessmentType): Promise<AssessmentOption[]> {
    let allAssessments: Array<Assessment> = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    this.assessmentDbService.setAll(allAssessments);
    this.assessmentsByType = allAssessments.filter(assessment => { return assessment.type == assessmentType });
    if (assessmentType === 'PHAST') {
      this.assessmentsByType = this.assessmentsByType.filter(assessment => this.isPhastSetUp(assessment));
    }
    this.assessmentsByType = _.orderBy(this.assessmentsByType, 'modifiedDate');
    let assessmentOptions = this.assessmentsByType.map(assessment => { return { display: assessment.name, id: assessment.id } });
    return assessmentOptions;
  }

  /**
   * Treasure Hunt calculates from the legacy shape, which reads the heat balance unguarded.
   * @param assessment Process Heating assessment as saved by either module
   * @returns whether the assessment can be calculated for Treasure Hunt
   */
  private isPhastSetUp(assessment: Assessment): boolean {
    return toLegacyPhastAssessment(assessment, this.settingsDbService.getByAssessmentId(assessment)).phast.setupDone;
  }
  

  navigateToIntegratedAssessment(integratedAssessment: IntegratedAssessment) {
    if (integratedAssessment) {
      let url: string = integratedAssessment.navigation.url;

      if (url) {
        this.assessmentService.setStartingTab('assessment')
        this.router.navigate([url], {
          queryParams: integratedAssessment.navigation.queryParams
        }
        );
      }

    }
  }

}


export interface IntegratedAssessment {
  assessment: Assessment,
  name: string,
  hasModifications?: boolean,
  assessmentType: AssessmentType,
  thEquipmentType?: string,
  energyOptions?: IntegratedEnergyOptions,
  baselineEnergyUseItems?: Array<EnergyUseItem>,
  modificationEnergyUseItems?: Array<ModificationEnergyOption>,
  selectedModificationId: string,
  navigation?: {
    queryParams: any,
    url: string
  }
}

export interface IntegratedEnergyOptions {
  baseline: AssessmentEnergyOption;
  modifications: AssessmentEnergyOption[],
}

export interface AssessmentEnergyOption {
  name: string,
  modificationId?: string,
  annualEnergy: number,
  co2EmissionsOutput: number,
  annualCost: number,
  energyThDisplayUnits?: string
}

export interface ModificationEnergyOption {
  modificationId: string,
  energies: Array<EnergyUseItem>
}

export interface ExistingIntegrationData {
  assessmentId: number,
  assessmentType: AssessmentType,
  assessmentName: string,
  selectedModificationId: string,
  energyOptions: IntegratedEnergyOptions,
}
