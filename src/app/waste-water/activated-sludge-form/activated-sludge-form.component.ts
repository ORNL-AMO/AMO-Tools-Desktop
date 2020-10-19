import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedSludgeData, WasteWater, WasteWaterData } from '../../shared/models/waste-water';
import { ActivatedSludgeDifferent, CompareService } from '../modify-conditions/compare.service';
import { WasteWaterService } from '../waste-water.service';
import { ActivatedSludgeFormService } from './activated-sludge-form.service';

@Component({
  selector: 'app-activated-sludge-form',
  templateUrl: './activated-sludge-form.component.html',
  styleUrls: ['./activated-sludge-form.component.css']
})
export class ActivatedSludgeFormComponent implements OnInit {
  @Input()
  isModification: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;

  form: FormGroup;

  modificationIndex: number;
  selectedModificationIdSub: Subscription;
  wasteWaterDifferentSub: Subscription;
  activatedSludgeDifferent: ActivatedSludgeDifferent;
  constructor(private wasteWaterService: WasteWaterService, private activatedSludgeFormService: ActivatedSludgeFormService,
    private compareService: CompareService) { }

  ngOnInit(): void {
    if (this.isModification) {
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

    this.wasteWaterDifferentSub = this.compareService.wasteWaterDifferent.subscribe(val => {
      this.activatedSludgeDifferent = val.activatedSludgeDifferent;
    });
  }

  ngOnDestroy() {
    if (this.selectedModificationIdSub) this.selectedModificationIdSub.unsubscribe();
    this.wasteWaterDifferentSub.unsubscribe();
  }

  save() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    if (this.isModification) {
      let activatedSludgeData: ActivatedSludgeData = this.activatedSludgeFormService.getObjFromForm(this.form);
      wasteWater.modifications[this.modificationIndex].activatedSludgeData = activatedSludgeData;
    } else {
      let activatedSludgeData: ActivatedSludgeData = this.activatedSludgeFormService.getObjFromForm(this.form);
      wasteWater.baselineData.activatedSludgeData = activatedSludgeData;
    }
    this.wasteWaterService.wasteWater.next(wasteWater);
  }

  focusField(str: string) {

  }
}
