import { Component, OnInit, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { O2Enrichment, O2EnrichmentOutput } from '../../../../shared/models/phast/o2Enrichment';
import { Settings } from '../../../../shared/models/settings';
import { O2EnrichmentService } from '../o2-enrichment.service';
import { FormGroup, AbstractControl } from '@angular/forms';
import { OperatingHours } from '../../../../shared/models/operations';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-o2-enrichment-form',
  templateUrl: './o2-enrichment-form.component.html',
  styleUrls: ['./o2-enrichment-form.component.css']
})
export class O2EnrichmentFormComponent implements OnInit {
  @Input()
  settings: Settings;
  isBaseline: boolean = true;
  o2Form: FormGroup;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;
  isEditingName: boolean = false;
  showOperatingHoursModal: boolean;
  editingPlot: boolean = false;
  operatingHoursControl: AbstractControl;

  currentEnrichmentIndexSub: Subscription;
  currentEnrichmentIndex: any;

  currentEnrichmentOutput: O2EnrichmentOutput;
  outputSub: Subscription;
  constructor(private o2EnrichmentService: O2EnrichmentService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.initSubscriptions();
    this.o2EnrichmentService.setRanges(this.o2Form, this.settings);
  }

  ngOnDestroy() {
    this.currentEnrichmentIndexSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.setOpHoursModalWidth();
  }

  initSubscriptions() {
    this.currentEnrichmentIndexSub = this.o2EnrichmentService.currentEnrichmentIndex.subscribe(index => {
      let inputs: Array<O2Enrichment> = this.o2EnrichmentService.enrichmentInputs.getValue();
      if (inputs) {
        this.initForm(inputs, index);
      }
    });

    this.outputSub = this.o2EnrichmentService.enrichmentOutputs.subscribe(outputs => {
      let currentEnrichmentIndex = this.o2EnrichmentService.currentEnrichmentIndex.getValue();
      this.currentEnrichmentOutput = outputs[currentEnrichmentIndex];
    });
  }

  initForm(inputs, index: number) {
    this.currentEnrichmentIndex = index;
    let currentEnrichment = inputs[index];

    this.o2Form = this.o2EnrichmentService.initFormFromObj(this.settings, currentEnrichment);
    this.cd.detectChanges();
    if (this.currentEnrichmentIndex == 0) {
      this.isBaseline = true;
      this.o2Form.controls.o2CombAir.disable();
    } else {
      this.isBaseline = false;
      this.o2Form.controls.o2CombAir.enable();
    }
  }

  addModification() {
    let currentEnrichment = this.o2EnrichmentService.getObjFromForm(this.o2Form);
    currentEnrichment.name = 'Modification';
    let enrichmentInputs: Array<O2Enrichment> = this.o2EnrichmentService.enrichmentInputs.getValue();
    enrichmentInputs.push(currentEnrichment);
    this.o2EnrichmentService.enrichmentInputs.next(enrichmentInputs);
    this.o2EnrichmentService.currentEnrichmentIndex.next(enrichmentInputs.length - 1);
  }

  removeModification() {
    let enrichmentInputs: Array<O2Enrichment> = this.o2EnrichmentService.enrichmentInputs.getValue();
    enrichmentInputs.splice(this.currentEnrichmentIndex, 1);
    this.o2EnrichmentService.enrichmentInputs.next(enrichmentInputs);
    this.o2EnrichmentService.currentEnrichmentIndex.next(this.currentEnrichmentIndex - 1);
  }


  calculate() {
    this.o2EnrichmentService.setRanges(this.o2Form, this.settings);
    let currentEnrichment: O2Enrichment = this.o2EnrichmentService.getObjFromForm(this.o2Form);
    let enrichmentInputs = this.o2EnrichmentService.enrichmentInputs.getValue();
    enrichmentInputs[this.currentEnrichmentIndex] = currentEnrichment;
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