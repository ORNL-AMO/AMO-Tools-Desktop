import { ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { OperatingHours } from '../../../../shared/models/operations';
import { FlueGasModalData } from '../../../../shared/models/phast/heatCascading';
import { WasteHeatInput, WasteHeatWarnings } from '../../../../shared/models/phast/wasteHeat';
import { Settings } from '../../../../shared/models/settings';
import { WasteHeatFormService } from '../waste-heat-form.service';
import { WasteHeatService } from '../waste-heat.service';

@Component({
  selector: 'app-waste-heat-form',
  templateUrl: './waste-heat-form.component.html',
  styleUrls: ['./waste-heat-form.component.css']
})
export class WasteHeatFormComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  inModal: boolean;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @ViewChild('flueGasModal', { static: false }) public flueGasModal: ModalDirective;
  showFlueGasModal: boolean;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }
  form: UntypedFormGroup;
  formWidth: number;

  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  showOperatingHoursModal: boolean = false;
  warnings: WasteHeatWarnings;
  
  constructor(private wasteHeatService: WasteHeatService, 
              private wasteHeatFormService: WasteHeatFormService) { }

  ngOnInit() {
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.resetDataSub = this.wasteHeatService.resetData.subscribe(value => {
      this.initForm();
    })
    this.generateExampleSub = this.wasteHeatService.generateExample.subscribe(value => {
      this.initForm();
    })
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
  }

  initForm() {
    let wasteHeatInput: WasteHeatInput = this.wasteHeatService.wasteHeatInput.getValue();
    this.form = this.wasteHeatFormService.getWasteHeatForm(wasteHeatInput, this.settings);
    this.calculate();
  }


  focusField(str: string) {
    this.wasteHeatService.currentField.next(str);
  }

  calculate() {
    this.form = this.wasteHeatFormService.setChillerTempValidators(this.form, this.settings);
    let updatedInput: WasteHeatInput = this.wasteHeatFormService.getWasteHeatInput(this.form);
    this.warnings = this.wasteHeatFormService.checkWasteHeatWarnings(updatedInput);
    this.wasteHeatService.wasteHeatInput.next(updatedInput);
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.form.controls.oppHours.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  initFlueGasModal() {
    this.showFlueGasModal = true;
    this.wasteHeatService.modalOpen.next(this.showFlueGasModal);
    this.flueGasModal.show();
  }

  hideFlueGasModal(flueGasModalData?: FlueGasModalData) {
    if (flueGasModalData) {
      flueGasModalData.calculatedAvailableHeat = this.wasteHeatService.roundVal(flueGasModalData.calculatedAvailableHeat, 1);
      this.form.patchValue({
        availableHeat: flueGasModalData.calculatedAvailableHeat
      });
    }
    this.calculate();
    this.flueGasModal.hide();
    this.showFlueGasModal = false;
    this.wasteHeatService.modalOpen.next(this.showFlueGasModal);
  }

}
