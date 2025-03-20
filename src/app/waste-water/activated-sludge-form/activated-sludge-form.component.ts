import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Settings } from '../../shared/models/settings';
import { ActivatedSludgeData, WasteWater, WasteWaterData } from '../../shared/models/waste-water';
import { ActivatedSludgeDifferent, CompareService } from '../modify-conditions/compare.service';
import { WasteWaterService } from '../waste-water.service';
import { ActivatedSludgeFormService } from './activated-sludge-form.service';

@Component({
    selector: 'app-activated-sludge-form',
    templateUrl: './activated-sludge-form.component.html',
    styleUrls: ['./activated-sludge-form.component.css'],
    standalone: false
})
export class ActivatedSludgeFormComponent implements OnInit {
  @Input()
  isModification: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;

  form: UntypedFormGroup;

  modificationIndex: number;
  selectedModificationIdSub: Subscription;
  wasteWaterDifferentSub: Subscription;
  activatedSludgeDifferent: ActivatedSludgeDifferent;
  settings: Settings;
  idString: string = 'baseline';
  constructor(private wasteWaterService: WasteWaterService, private activatedSludgeFormService: ActivatedSludgeFormService,
    private compareService: CompareService) { }

  ngOnInit(): void {
    this.settings = this.wasteWaterService.settings.getValue();
    if (this.isModification) {
      this.idString = 'modification';
      this.selectedModificationIdSub = this.wasteWaterService.selectedModificationId.subscribe(val => {
        if (val) {
          let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
          this.modificationIndex = wasteWater.modifications.findIndex(modification => { return modification.id == val });
          let modificationData: WasteWaterData = this.wasteWaterService.getModificationFromId();
          this.form = this.activatedSludgeFormService.getFormFromObj(modificationData.activatedSludgeData);
        }
      });
    } else {
      let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
      this.form = this.activatedSludgeFormService.getFormFromObj(wasteWater.baselineData.activatedSludgeData);
    }
    this.setFormControlStatus();
    this.wasteWaterDifferentSub = this.compareService.wasteWaterDifferent.subscribe(val => {
      this.activatedSludgeDifferent = val.activatedSludgeDifferent;
    });
  }

  ngOnDestroy() {
    if (this.selectedModificationIdSub) this.selectedModificationIdSub.unsubscribe();
    this.wasteWaterDifferentSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.isFirstChange()) {
      this.setFormControlStatus();
    }
  }

  save() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    if (this.isModification) {
      let activatedSludgeData: ActivatedSludgeData = this.activatedSludgeFormService.getObjFromForm(this.form);
      wasteWater.modifications[this.modificationIndex].activatedSludgeData = activatedSludgeData;
      wasteWater.modifications[this.modificationIndex].exploreOpportunities = false;
    } else {
      let activatedSludgeData: ActivatedSludgeData = this.activatedSludgeFormService.getObjFromForm(this.form);
      wasteWater.baselineData.activatedSludgeData = activatedSludgeData;
    }
    this.wasteWaterService.updateWasteWater(wasteWater);
  }

  focusField(str: string) {
    this.wasteWaterService.focusedField.next(str);
  }

  setFormControlStatus() {
    if (this.selected === true) {
      this.form.controls.CalculateGivenSRT.enable();

    } else if (this.selected === false) {
      this.form.controls.CalculateGivenSRT.disable();
    }
  }

  changePlantControlPoint() {
    if (this.form.controls.CalculateGivenSRT.value == true) {
      this.form.controls.MLSSpar.setValidators([]);
      this.form.controls.MLSSpar.updateValueAndValidity();
      this.form.controls.DefinedSRT.setValidators([Validators.required, Validators.min(0)]);
      this.form.controls.DefinedSRT.updateValueAndValidity();
    } else {
      this.form.controls.MLSSpar.setValidators([Validators.required, Validators.min(0)]);
      this.form.controls.MLSSpar.updateValueAndValidity();
      this.form.controls.DefinedSRT.setValidators([]);
      this.form.controls.DefinedSRT.updateValueAndValidity();
    }
    this.save();
  }

  calculateSo() {
    if (!this.form.controls.isUserDefinedSo.value) {
      let influentCBODBefore: number = this.form.controls.influentCBODBefore.value;
      let clarifierEfficiency: number = this.form.controls.clarifierEfficiency.value;

      if (influentCBODBefore && clarifierEfficiency) {
        let calculatedSo: number =  influentCBODBefore * (clarifierEfficiency / 100);
        this.form.patchValue({
          So: calculatedSo
        })
      }
    }
    this.save();
  }

  showHideInputField() {
    this.form.patchValue({
      isUserDefinedSo: !this.form.controls.isUserDefinedSo.value
    });
    this.form = this.activatedSludgeFormService.setSoCalculateValidators(this.form);
    if (!this.form.controls.isUserDefinedSo.value) {
      this.calculateSo();
    }
    this.save();
  }
}
