import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Settings } from '../../shared/models/settings';
import { AeratorPerformanceData, WasteWater, WasteWaterData } from '../../shared/models/waste-water';
import { AeratorPerformanceDifferent, CompareService } from '../modify-conditions/compare.service';
import { AerationRanges, aerationRanges, aeratorTypes, getSOTRDefaults } from '../waste-water-defaults';
import { WasteWaterService } from '../waste-water.service';
import { AeratorPerformanceFormService, AeratorPerformanceWarnings } from './aerator-performance-form.service';

@Component({
  selector: 'app-aerator-performance-form',
  templateUrl: './aerator-performance-form.component.html',
  styleUrls: ['./aerator-performance-form.component.css']
})
export class AeratorPerformanceFormComponent implements OnInit {
  @Input()
  isModification: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;

  aerationRanges: AerationRanges;
  SOTRDefaults: Array<{ label: string, value: number }>;
  aeratorTypes: Array<{ value: number, display: string }>;
  form: FormGroup;
  modificationIndex: number;
  selectedModificationIdSub: Subscription;
  aeratorPerformanceDifferent: AeratorPerformanceDifferent;
  wasteWaterDifferentSub: Subscription;
  settings: Settings;
  aeratorPerformanceWarnings: AeratorPerformanceWarnings;
  idString: string = 'baseline';
  showDOAlert: boolean = false;
  showOperatingTimeAlert: boolean = false;
  showSpeedAlert: boolean = false;
  constructor(private wasteWaterService: WasteWaterService, private aeratorPerformanceFormService: AeratorPerformanceFormService,
    private compareService: CompareService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.settings = this.wasteWaterService.settings.getValue();
    this.aerationRanges = aerationRanges;
    this.SOTRDefaults = getSOTRDefaults();

    if (this.isModification) {
      this.idString = 'modification';
      this.selectedModificationIdSub = this.wasteWaterService.selectedModificationId.subscribe(val => {
        if (val) {
          let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
          this.modificationIndex = wasteWater.modifications.findIndex(modification => { return modification.id == val });
          let modificationData: WasteWaterData = this.wasteWaterService.getModificationFromId();
          this.aeratorPerformanceWarnings = this.aeratorPerformanceFormService.checkWarnings(modificationData.aeratorPerformanceData);
          this.form = this.aeratorPerformanceFormService.getFormFromObj(modificationData.aeratorPerformanceData);
          this.setDefaultSOTR();
        }
      });
    } else {
      let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
      this.aeratorPerformanceWarnings = this.aeratorPerformanceFormService.checkWarnings(wasteWater.baselineData.aeratorPerformanceData);
      this.form = this.aeratorPerformanceFormService.getFormFromObj(wasteWater.baselineData.aeratorPerformanceData);
      this.setDefaultSOTR();
    }
    this.setFormControlStatus();

    this.wasteWaterDifferentSub = this.compareService.wasteWaterDifferent.subscribe(val => {
      this.aeratorPerformanceDifferent = val.aeratorPerformanceDifferent;
      this.cd.detectChanges();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.isFirstChange()) {
      this.setFormControlStatus();
    }
  }

  ngOnDestroy() {
    if (this.selectedModificationIdSub) this.selectedModificationIdSub.unsubscribe();
    this.wasteWaterDifferentSub.unsubscribe();
  }

  setAeratorTypeStatus() {
    let defaultAeratorTypes: Array<{ value: number, display: string }> = JSON.parse(JSON.stringify(aeratorTypes));
    let isDiffuserAerator: boolean = this.aerationRanges.diffusers.some(aerationRange => aerationRange.label == this.form.controls.Aerator.value);
    this.form.controls.TypeAerators.enable();

    if (this.form.controls.Aerator.value == 'Other') {
      this.aeratorTypes = defaultAeratorTypes;
    } else if (isDiffuserAerator) {
      // Mechanical is removed. set to next option.
      if (this.form.controls.TypeAerators.value == 1) {
        this.form.patchValue({
          TypeAerators: defaultAeratorTypes[1].value
        });
      }
      this.aeratorTypes = defaultAeratorTypes.filter(aerator => aerator.value != 1);
    } else {
      this.aeratorTypes = defaultAeratorTypes;
      this.form.patchValue({
        TypeAerators: defaultAeratorTypes[0].value
      });
      this.form.controls.TypeAerators.disable();
    }

    if (!this.selected) {
      this.form.controls.TypeAerators.disable();
    }
  }

  setDefaultSOTR() {
    if (this.form.controls.Aerator.value != 'Other') {
      let SOTRDefault: number = this.SOTRDefaults.find(SOTRValue => SOTRValue.label == this.form.controls.Aerator.value).value;
      this.form.patchValue({
        SOTR: SOTRDefault
      });
    } else {
      this.form.patchValue({
        SOTR: undefined
      });
    }
    this.setAeratorTypeStatus();
    this.save();
  }

  setFormControlStatus() {
    if (this.selected === true) {
      this.form.controls.Aerator.enable();
      this.form.controls.AnoxicZoneCondition.enable();

    } else if (this.selected === false) {
      this.form.controls.Aerator.disable();
      this.form.controls.AnoxicZoneCondition.disable();
    }
    this.setAeratorTypeStatus();
  }

  save() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    if (this.isModification) {
      let aeratorPerformanceData: AeratorPerformanceData = this.aeratorPerformanceFormService.getObjFromForm(this.form);
      this.aeratorPerformanceWarnings = this.aeratorPerformanceFormService.checkWarnings(aeratorPerformanceData);
      wasteWater.modifications[this.modificationIndex].aeratorPerformanceData = aeratorPerformanceData;
    } else {
      let aeratorPerformanceData: AeratorPerformanceData = this.aeratorPerformanceFormService.getObjFromForm(this.form);
      this.aeratorPerformanceWarnings = this.aeratorPerformanceFormService.checkWarnings(aeratorPerformanceData);
      wasteWater.baselineData.aeratorPerformanceData = aeratorPerformanceData;
    }
    this.wasteWaterService.updateWasteWater(wasteWater);
  }

  focusField(str: string) {
    this.wasteWaterService.focusedField.next(str);
  }


  calculateDO() {
    let optimalDo: number = this.wasteWaterService.calculateModDo(this.modificationIndex);
    if (optimalDo == this.form.controls.OperatingDO.value) {
      this.showDOAlert = true;
      setTimeout(() => {
        this.showDOAlert = false;
      }, 1500);
    } else {
      this.form.controls.OperatingDO.patchValue(optimalDo);
      this.save();
    }
  }

  calculateOperatingTime() {
    let optimalOperatingTime: number = this.wasteWaterService.calculateModOperatingTime(this.modificationIndex);
    if (optimalOperatingTime == this.form.controls.OperatingTime.value) {
      this.showOperatingTimeAlert = true;
      setTimeout(() => {
        this.showOperatingTimeAlert = false;
      }, 1500);
    } else {
      this.form.controls.OperatingTime.patchValue(optimalOperatingTime);
      this.save();
    }
  }
  calculateSpeed() {
    let optimalSpeed: number = this.wasteWaterService.calculateModSpeed(this.modificationIndex);
    if (optimalSpeed == this.form.controls.Speed.value) {
      this.showSpeedAlert = true;
      setTimeout(() => {
        this.showSpeedAlert = false;
      }, 1500);
    } else {
      this.form.controls.Speed.patchValue(optimalSpeed);
      this.save();
    }
  }
}
