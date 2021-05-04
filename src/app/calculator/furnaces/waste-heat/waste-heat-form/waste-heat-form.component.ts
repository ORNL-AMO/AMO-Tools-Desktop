import { ElementRef, HostListener, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { OperatingHours } from '../../../../shared/models/operations';
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
  isBaseline: boolean;
  @Input()
  selected: boolean;
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
  form: FormGroup;
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      this.setFormState();
    }
  }

  setFormState() {
    if (this.selected == false) {
      this.form.disable();
    } else {
      this.form.enable();
    }
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
    let wasteHeatInput: WasteHeatInput
    if (this.isBaseline) {
      wasteHeatInput = this.wasteHeatService.baselineData.getValue();
    } else {
      wasteHeatInput = this.wasteHeatService.modificationData.getValue();
    }
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
    if (this.isBaseline) {
      this.wasteHeatService.baselineData.next(updatedInput);
    } else {
      this.wasteHeatService.modificationData.next(updatedInput);
    }
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

  hideFlueGasModal(calculatedAvailableHeat?: any) {
    if (calculatedAvailableHeat) {
      calculatedAvailableHeat = this.wasteHeatService.roundVal(calculatedAvailableHeat, 1);
      this.form.patchValue({
        availableHeat: calculatedAvailableHeat
      });
    }
    this.calculate();
    this.flueGasModal.hide();
    this.showFlueGasModal = false;
    this.wasteHeatService.modalOpen.next(this.showFlueGasModal);
  }


}
