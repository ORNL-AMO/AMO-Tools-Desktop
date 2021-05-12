import { ChangeDetectorRef, ElementRef, HostListener, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { OperatingHours } from '../../../../shared/models/operations';
import { WasteHeatInput, WasteHeatWarnings } from '../../../../shared/models/phast/wasteHeat';
import { Settings } from '../../../../shared/models/settings';
import { TreasureHuntUtilityOption, treasureHuntUtilityOptions } from '../../furnace-defaults';
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
  @Input()
  inTreasureHunt: boolean;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @ViewChild('flueGasModal', { static: false }) public flueGasModal: ModalDirective;
  showFlueGasModal: boolean;
  
  energyUnit: string;
  treasureHuntUtilityOptions: Array<TreasureHuntUtilityOption>;
  energySourceTypeSub: Subscription;

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
              private cd: ChangeDetectorRef,
              private wasteHeatFormService: WasteHeatFormService) { }

  ngOnInit() {
    this.initSubscriptions();
    this.energyUnit = this.wasteHeatService.getAnnualEnergyUnit(this.form.controls.energySourceType.value, this.settings);
    if (!this.isBaseline) {
      let energySource = this.wasteHeatService.energySourceType.getValue();
      this.setEnergySource(energySource);
    } else {
      this.wasteHeatService.energySourceType.next(this.form.controls.energySourceType.value);
    }

    if (this.inTreasureHunt) {
      this.treasureHuntUtilityOptions = treasureHuntUtilityOptions;
    }
    this.setEnergySource();
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

    if (this.inTreasureHunt && !this.isBaseline) {
      this.form.controls.energySourceType.disable();
    }
  }
  
  initSubscriptions() {
    this.resetDataSub = this.wasteHeatService.resetData.subscribe(value => {
      this.initForm();
      this.cd.detectChanges();
    })
    this.generateExampleSub = this.wasteHeatService.generateExample.subscribe(value => {
      this.initForm();
    })
    if (!this.isBaseline) {
      this.energySourceTypeSub = this.wasteHeatService.energySourceType.subscribe(energySourceType => {
        this.setEnergySource(energySourceType);
      });
    }
  }

  setEnergySource(baselineEnergySource?: string) {
    if (baselineEnergySource) {
      this.form.patchValue({
        energySourceType: baselineEnergySource
      });
    }
    this.energyUnit = this.wasteHeatService.getAnnualEnergyUnit(this.form.controls.energySourceType.value, this.settings);

    if (this.isBaseline) {
      this.wasteHeatService.energySourceType.next(this.form.controls.energySourceType.value);
    }
    this.cd.detectChanges();
    this.calculate();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
    if (!this.isBaseline) {
      this.energySourceTypeSub.unsubscribe();
    }
  }

  initForm() {
    let wasteHeatInput: WasteHeatInput
    if (this.isBaseline) {
      wasteHeatInput = this.wasteHeatService.baselineData.getValue();
    } else {
      wasteHeatInput = this.wasteHeatService.modificationData.getValue();
    }
    if (wasteHeatInput) {
      this.form = this.wasteHeatFormService.getWasteHeatForm(wasteHeatInput, this.settings);
      this.calculate();
    }
    this.setFormState();
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
