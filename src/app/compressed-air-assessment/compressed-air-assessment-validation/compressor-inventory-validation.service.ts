import { Injectable } from '@angular/core';
import { CompressedAirAssessment, CompressorInventoryItem, SystemInformation } from '../../shared/models/compressed-air-assessment';
import { UntypedFormGroup } from '@angular/forms';
import { CompressorInventoryItemClass } from '../calculations/CompressorInventoryItemClass';
import { PerformancePointsFormService } from '../baseline-tab-content/inventory-setup/inventory/performance-points/performance-points-form.service';
import { CompressorItemValidation } from './CompressedAirAssessmentValidation';
import { InventoryFormService } from '../baseline-tab-content/inventory-setup/inventory/inventory-form.service';

@Injectable({
  providedIn: 'root'
})
export class CompressorInventoryValidationService {

  constructor(private inventoryFormService: InventoryFormService,
    private performancePointsFormService: PerformancePointsFormService
  ) { }

  //TODO: Need to also validate replacement compressors..
  validateCompressors(compressedAirAssessment: CompressedAirAssessment): Array<CompressorItemValidation> {
    let compressorValidations: Array<CompressorItemValidation> = new Array();
    if (compressedAirAssessment.compressorInventoryItems && compressedAirAssessment.compressorInventoryItems.length > 0) {
      compressedAirAssessment.compressorInventoryItems.forEach(compressorInventoryItem => {
        let compressorItemValidation: CompressorItemValidation = this.validateCompressorItem(compressorInventoryItem, compressedAirAssessment.systemInformation);
        compressorValidations.push(compressorItemValidation);
      });
    }
    return compressorValidations;
  }


  validateCompressorItem(compressor: CompressorInventoryItem, systemInformation: SystemInformation): CompressorItemValidation {
    let nameplateValid: boolean = this.inventoryFormService.getNameplateDataFormFromObj(compressor.nameplateData).valid;
    let compressorTypeValid: boolean = true;
    if (systemInformation.multiCompressorSystemControls == 'loadSharing') {
      //load sharing must be centrifugal
      compressorTypeValid = (compressor.nameplateData.compressorType == 6);
    }
    let compressorControlsValid: boolean = this.inventoryFormService.getCompressorControlsFormFromObj(compressor.compressorControls, compressor.nameplateData.compressorType).valid;
    let designDetailsValid: boolean = this.inventoryFormService.getDesignDetailsFormFromObj(compressor.designDetails, compressor.nameplateData.compressorType, compressor.compressorControls.controlType).valid;
    let centrifugalSpecsValid: boolean = this.checkCentrifugalSpecsValid(compressor);
    let compressorInventoryItemClass: CompressorInventoryItemClass = new CompressorInventoryItemClass(compressor);
    let performancePointsValid: boolean = this.checkPerformancePointsValid(compressorInventoryItemClass, systemInformation);
    return {
      compressorId: compressor.itemId,
      nameplateValid: nameplateValid,
      compressorTypeValid: compressorTypeValid,
      compressorControlsValid: compressorControlsValid,
      designDetailsValid: designDetailsValid,
      centrifugalSpecsValid: centrifugalSpecsValid,
      performancePointsValid: performancePointsValid,
      isValid: (nameplateValid && compressorTypeValid && compressorControlsValid && designDetailsValid && centrifugalSpecsValid && performancePointsValid)
    }
  }

  checkPerformancePointsValid(compressor: CompressorInventoryItemClass, systemInformation: SystemInformation): boolean {
    let fullLoadForm: UntypedFormGroup = this.performancePointsFormService.getPerformancePointFormFromObj(compressor.performancePoints.fullLoad, compressor, 'fullLoad', systemInformation);
    let isValid: boolean = fullLoadForm.valid;
    if (isValid && compressor.showMaxFullFlow) {
      let maxFlowForm: UntypedFormGroup = this.performancePointsFormService.getPerformancePointFormFromObj(compressor.performancePoints.maxFullFlow, compressor, 'maxFullFlow', systemInformation);
      isValid = maxFlowForm.valid;
    }
    if (isValid && compressor.showUnloadPoint) {
      let unloadForm: UntypedFormGroup = this.performancePointsFormService.getPerformancePointFormFromObj(compressor.performancePoints.unloadPoint, compressor, 'unloadPoint', systemInformation);
      isValid = unloadForm.valid;
    }
    if (isValid && compressor.showNoLoadPoint) {
      let noLoadForm: UntypedFormGroup = this.performancePointsFormService.getPerformancePointFormFromObj(compressor.performancePoints.noLoad, compressor, 'noLoad', systemInformation);
      isValid = noLoadForm.valid;
    }
    if (isValid && compressor.showBlowoffPoint) {
      let blowoffForm: UntypedFormGroup = this.performancePointsFormService.getPerformancePointFormFromObj(compressor.performancePoints.blowoff, compressor, 'blowoff', systemInformation);
      isValid = blowoffForm.valid;
    }
    return isValid;
  }

  checkCentrifugalSpecsValid(compressor: CompressorInventoryItem): boolean {
    if (compressor.nameplateData.compressorType == 6) {
      let form: UntypedFormGroup = this.inventoryFormService.getCentrifugalFormFromObj(compressor);
      return form.valid;
    }
    return true;
  }
}
