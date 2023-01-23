import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem, Modification, ReplaceCompressorsEEM } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { PerformancePointsFormService } from '../../inventory/performance-points/performance-points-form.service';
import { ExploreOpportunitiesValidationService } from '../explore-opportunities-validation.service';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';
import { ReplaceCompressorsService } from './replace-compressors.service';

@Component({
  selector: 'app-replace-compressor',
  templateUrl: './replace-compressor.component.html',
  styleUrls: ['./replace-compressor.component.css']
})
export class ReplaceCompressorComponent {
  selectedModificationIdSub: Subscription;
  isFormChange: boolean = false;
  selectedModificationIndex: number;
  orderOptions: Array<number>;
  compressedAirAssessmentSub: Subscription;
  compressedAirAssessment: CompressedAirAssessment;
  form: UntypedFormGroup;
  settings: Settings;
  replaceCompressorsEEM: ReplaceCompressorsEEM;
  compressorInventoryItems: Array<CompressorInventoryItem>;

  @ViewChild('replacementModal', { static: false }) public replacementModal: ModalDirective;
  @ViewChild('modalDialog', { static: false }) public modalDialog: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getBodyHeight();
  }

  showReplacementModal: boolean = false;
  modalSub: Subscription;
  bodyHeight: number = 0;

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, 
    private exploreOpportunitiesService: ExploreOpportunitiesService,
    private replaceCompressorsService: ReplaceCompressorsService,
    private performancePointsFormService: PerformancePointsFormService,
    private exploreOpportunitiesValidationService: ExploreOpportunitiesValidationService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(compressedAirAssessment => {
      if (compressedAirAssessment && !this.isFormChange) {
        this.compressedAirAssessment = JSON.parse(JSON.stringify(compressedAirAssessment));
        this.setOrderOptions();
        this.setData()
      } else {
        this.isFormChange = false;
      }
    });

    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (val && !this.isFormChange) {
        this.selectedModificationIndex = this.compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == val });
        this.setData();
      } else {
        this.isFormChange = false;
      }
      this.setOrderOptions();
    });
  }
  
  getBodyHeight() {
      if (this.modalDialog) {
          this.bodyHeight = this.modalDialog.nativeElement.clientHeight;
      } 
  }

  ngOnDestroy() {
    this.selectedModificationIdSub.unsubscribe();
    this.compressedAirAssessmentSub.unsubscribe();
  }

  helpTextField(str: string) {
    this.compressedAirAssessmentService.helpTextField.next(str);
    this.compressedAirAssessmentService.focusedField.next('replaceCompressors');
  }

  manageModificationCompressors() {
    this.compressedAirAssessmentService.secondaryAssessmentTab.next('modified-inventory');
  }

  setData() {
    if (this.compressedAirAssessment && this.selectedModificationIndex !== undefined) {
      let modification: Modification = this.compressedAirAssessment.modifications[this.selectedModificationIndex];
      this.replaceCompressorsEEM = JSON.parse(JSON.stringify(modification.replaceCompressorsEEM));
      this.form = this.replaceCompressorsService.getFormFromObj(this.replaceCompressorsEEM);
      if (this.replaceCompressorsEEM.order != 100) {
        this.exploreOpportunitiesValidationService.replaceCompressorsValid.next(this.form.valid);
      }
      
      if (modification.modifiedCompressorInventoryItems) {
        this.compressorInventoryItems = modification.modifiedCompressorInventoryItems;
        console.log('compressorInventoryItems', this.compressorInventoryItems);      
      }
    }
  }

  save(isOrderChange: boolean) {
    this.isFormChange = true;
    let previousOrder: number = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].replaceCompressorsEEM.order));
    let updatedReplaceCompressorsEEM: ReplaceCompressorsEEM = this.replaceCompressorsService.getObjFromForm(this.form);
    this.compressedAirAssessment.modifications[this.selectedModificationIndex].replaceCompressorsEEM.order = updatedReplaceCompressorsEEM.order;
    this.compressedAirAssessment.modifications[this.selectedModificationIndex].replaceCompressorsEEM.implementationCost = updatedReplaceCompressorsEEM.implementationCost;
    if (isOrderChange) {
      this.isFormChange = false;
      let newOrder: number = this.form.controls.order.value;
      this.compressedAirAssessment.modifications[this.selectedModificationIndex] = this.exploreOpportunitiesService.setOrdering(this.compressedAirAssessment.modifications[this.selectedModificationIndex], 'replaceCompressors', previousOrder, newOrder);
    }
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, false);
    this.exploreOpportunitiesValidationService.replaceCompressorsValid.next(this.form.valid);
  }

  getPressureMinMax(compressor: CompressorInventoryItem): string {
    let minMax: { min: number, max: number } = this.performancePointsFormService.getCompressorPressureMinMax(compressor.compressorControls.controlType, compressor.performancePoints);
    let unit: string = ' psig';
    if (this.settings.unitsOfMeasure == 'Metric') {
      unit = ' barg';
    }

    return minMax.min + ' - ' + minMax.max + unit;
  }

  setOrderOptions() {
    if (this.compressedAirAssessment && this.selectedModificationIndex != undefined) {
      this.orderOptions = new Array();
      let modification: Modification = this.compressedAirAssessment.modifications[this.selectedModificationIndex];
      if (modification) {
        let allOrders: Array<number> = [
          modification.reduceRuntime.order,
          modification.addPrimaryReceiverVolume.order,
          modification.adjustCascadingSetPoints.order,
          modification.improveEndUseEfficiency.order,
          modification.reduceAirLeaks.order,
          modification.reduceSystemAirPressure.order,
          modification.useAutomaticSequencer.order
        ];
        allOrders = allOrders.filter(order => { return order != 100 });
        let numOrdersOn: number = allOrders.length;
        for (let i = 1; i <= numOrdersOn + 1; i++) {
          this.orderOptions.push(i);
        }
      }
    }
  }

}
