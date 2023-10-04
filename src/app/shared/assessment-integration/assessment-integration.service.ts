import { Injectable } from '@angular/core';
import { Assessment } from '../models/assessment';
import { EnergyUseItem } from '../models/treasure-hunt';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import * as _ from 'lodash';
import { AssessmentOption, AssessmentType } from '../connected-inventory/integrations';
import { PsatService } from '../../psat/psat.service';
import { Settings } from '../models/settings';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { FsatService } from '../../fsat/fsat.service';
import { PhastIntegrationService } from '../../phast/phast-integration.service';

@Injectable({
  providedIn: 'root'
})
export class AssessmentIntegrationService {
  assessmentsByType: Assessment[];
  constructor(private assessmentDbService: AssessmentDbService, 
    private router: Router, 
    private settingsDbService: SettingsDbService,
    private psatService: PsatService,
    private fsatService: FsatService,
    private phastIntegrationService: PhastIntegrationService,
    ) { }

  async getExistingIntegratedAssessment(existingIntegrationData: ExistingIntegrationData) {
    let allAssessments: Array<Assessment> = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    this.assessmentDbService.setAll(allAssessments);
    this.assessmentsByType = allAssessments.filter(assessment => { return assessment.type == existingIntegrationData.assessmentType });
    let assessment = this.assessmentsByType.find(assessment => {assessment.id === existingIntegrationData.assessmentId});
    return assessment;
  }

  async setIntegratedAssessment(integratedAssessmentId: number, assessmentType: AssessmentType): Promise<IntegratedAssessment> {
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
      integratedAssessment.assessment = assessment;
      let assessmentSettings: Settings = this.settingsDbService.getByAssessmentId(assessment);
      if (assessmentType === 'PHAST') {
        this.phastIntegrationService.setIntegratedAssessmentData(integratedAssessment, assessmentSettings);
      } else if (assessmentType === 'PSAT') {
        this.psatService.setIntegratedAssessmentData(integratedAssessment, assessmentSettings);
      } else if (assessmentType === 'FSAT') {
        this.fsatService.setIntegratedAssessmentData(integratedAssessment, assessmentSettings);
      } else if (assessmentType === 'SSMT') {
      } else if (assessmentType === 'WasteWater') {
      } else if (assessmentType === 'CompressedAir') {
      }
    }

    return integratedAssessment;
  }

  checkHasUpdatedEnergyData(existingOptions: IntegratedEnergyOptions, updatedOptions: IntegratedEnergyOptions) {
    let hasUpdatedBaseline = this.checkisOptionDifferent(existingOptions.baseline, updatedOptions.baseline);
    let hasUpdatedModification: boolean = false;
    let existingMod = existingOptions.modifications[0];
    let updatedMod = updatedOptions.modifications.find(mod => mod.modificationId === existingMod.modificationId);
    if (updatedMod) {
     hasUpdatedModification = this.checkisOptionDifferent(existingMod, updatedMod);
    } 
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
    this.assessmentsByType = _.orderBy(this.assessmentsByType, 'modifiedDate');
    let assessmentOptions = this.assessmentsByType.map(assessment => { return { display: assessment.name, id: assessment.id } });
    return assessmentOptions;
  }
  

  navigateToIntegratedAssessment(integratedAssessment) {
    if (integratedAssessment) {
      let url: string = integratedAssessment.navigation.url;

      if (url) {
        this.router.navigate([url], {
          queryParams: integratedAssessment.navigation.queryParams
        }
        );
      }

    }
  }

}


export interface IntegratedAssessment {
  // todo 6453 can we get by with just id
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
  annualCost: number
}

export interface ModificationEnergyOption {
  modificationId: string,
  energies: Array<EnergyUseItem>
}

export interface ExistingIntegrationData {
  // todo 6453 can we get by with just id
  assessmentId: number,
  assessmentType: AssessmentType,
  assessmentName: string,
  selectedModificationId: string,
  energyOptions: IntegratedEnergyOptions
}
