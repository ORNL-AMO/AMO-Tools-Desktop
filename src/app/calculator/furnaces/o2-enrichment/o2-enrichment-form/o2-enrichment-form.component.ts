import { Component, OnInit, Input, HostListener, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { EnrichmentInput, EnrichmentOutput, EnrichmentInputData } from '../../../../shared/models/phast/o2Enrichment';
import { Settings } from '../../../../shared/models/settings';
import { O2EnrichmentService } from '../o2-enrichment.service';
import { UntypedFormGroup, AbstractControl } from '@angular/forms';
import { OperatingHours } from '../../../../shared/models/operations';
import { Subscription } from 'rxjs';
import { O2EnrichmentFormService } from '../o2-enrichment-form.service';

@Component({
  selector: 'app-o2-enrichment-form',
  templateUrl: './o2-enrichment-form.component.html',
  styleUrls: ['./o2-enrichment-form.component.css']
})
export class O2EnrichmentFormComponent implements OnInit {
  @Input()
  settings: Settings;
  
  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }
  
  formWidth: number;
  isEditingName: boolean = false;
  showOperatingHoursModal: boolean;
  operatingHoursControl: AbstractControl;
  o2Form: UntypedFormGroup;

  currentEnrichmentIndexSub: Subscription;
  currentEnrichmentIndex: number;
  currentEnrichmentOutput: EnrichmentOutput;

  constructor(private o2EnrichmentService: O2EnrichmentService, 
              private cd: ChangeDetectorRef,
              private o2FormService: O2EnrichmentFormService) { }

  ngOnInit() {
    this.initSubscriptions();
    this.o2FormService.setRanges(this.o2Form, this.settings);
  }

  ngOnDestroy() {
    this.currentEnrichmentIndexSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.setOpHoursModalWidth();
  }

  initSubscriptions() {
    this.currentEnrichmentIndexSub = this.o2EnrichmentService.currentEnrichmentIndex.subscribe(index => {
      this.currentEnrichmentIndex = index;
      let inputs: Array<EnrichmentInput> = this.o2EnrichmentService.enrichmentInputs.getValue();
      let outputs: Array<EnrichmentOutput> = this.o2EnrichmentService.enrichmentOutputs.getValue();
      this.currentEnrichmentOutput = outputs[index];
      if (inputs) {
        this.initForm(inputs, index);
      }
    });
  }

  initForm(inputs, index: number) {
    let currentInput = inputs[index];
    this.o2Form = this.o2FormService.initFormFromObj(this.settings, currentInput.inputData);
    this.cd.detectChanges();
    if (this.o2Form.controls.isBaseline.value) {
      this.o2Form.controls.o2CombAir.disable();
    } else {
      this.o2Form.controls.o2CombAir.enable();
    }
  }

  addModification() {
    this.o2EnrichmentService.addModification(this.o2Form);
  }

  removeModification() {
    this.o2EnrichmentService.removeModification(this.currentEnrichmentIndex);
  }


  calculate() {
    this.o2FormService.setRanges(this.o2Form, this.settings);
    let inputData: EnrichmentInputData = this.o2FormService.getObjFromForm(this.o2Form);
    let enrichmentInputs = this.o2EnrichmentService.enrichmentInputs.getValue();
    let currentInput = {
      inputData: inputData
    };
    enrichmentInputs[this.currentEnrichmentIndex] = currentInput;
    this.o2EnrichmentService.enrichmentInputs.next(enrichmentInputs);
  }


  changeField(str: string) {
    this.o2EnrichmentService.currentField.next(str);
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal(opHoursControl: AbstractControl) {
    this.operatingHoursControl = opHoursControl;
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.o2EnrichmentService.operatingHours = oppHours;
    this.operatingHoursControl.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  editCaseName() {
    this.isEditingName = true;
  }

  doneEditingName() {
    this.isEditingName = false;
  }
}