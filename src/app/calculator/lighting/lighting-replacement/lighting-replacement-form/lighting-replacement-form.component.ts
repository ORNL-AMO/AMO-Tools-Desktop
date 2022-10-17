import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges, HostListener, ChangeDetectorRef } from '@angular/core';
import { LightingReplacementData } from '../../../../shared/models/lighting';
import { UntypedFormGroup } from '@angular/forms';
import { LightingReplacementService } from '../lighting-replacement.service';
import { OperatingHours } from '../../../../shared/models/operations';
import { LightingFixtureData, LightingFixtureCategories } from '../../lighting-fixture-data/lighting-data';

@Component({
  selector: 'app-lighting-replacement-form',
  templateUrl: './lighting-replacement-form.component.html',
  styleUrls: ['./lighting-replacement-form.component.css']
})
export class LightingReplacementFormComponent implements OnInit {
  @Input()
  data: LightingReplacementData;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<LightingReplacementData>();
  @Output('emitRemoveFixture')
  emitRemoveFixture = new EventEmitter<number>();
  @Input()
  index: number;
  @Output('emitFocusField')
  emitFocusField = new EventEmitter<string>();
  @Input()
  isBaseline: boolean;
  @Input()
  selected: boolean;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;

  idString: string;
  isEditingName: boolean = false;
  form: UntypedFormGroup;

  showOperatingHoursModal: boolean;

  lightingFixtureCategories: Array<{ category: number, label: string, fixturesData: Array<LightingFixtureData> }>;
  fixtureTypes: Array<LightingFixtureData>;
  displayDetails: boolean = false;

  indicateLampsPerFixtureDiff: boolean = false;
  indicateWattsPerLampDiff: boolean = false;
  indicateLumensPerLampDiff: boolean = false;
  indicateCoefficientOfUtilizationDiff: boolean = false;
  indicateBallastFactorDiff: boolean = false;
  indicateLumenDegradationFactorDiff: boolean = false;
  indicateFixtureTypeDiff: boolean = false;

  constructor(private lightingReplacementService: LightingReplacementService, private cd: ChangeDetectorRef) {
    this.lightingFixtureCategories = LightingFixtureCategories;
  }

  ngOnInit() {
    this.displayDetails = this.lightingReplacementService.showAdditionalDetails;
    if (this.isBaseline) {
      this.idString = 'baseline_' + this.index;
    }
    else {
      this.idString = 'modification_' + this.index;
    }

    this.form = this.lightingReplacementService.getFormFromObj(this.data);
    this.fixtureTypes = this.lightingFixtureCategories.find(fixtureCategory => { return fixtureCategory.category == this.form.controls.category.value }).fixturesData;
    this.checkSelectFixtureDiff();
    this.lightingReplacementService.selectedFixtureTypes.next(this.fixtureTypes);
    if (this.selected == false) {
      this.form.disable();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected == false) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  calculate() {
    let tmpObj: LightingReplacementData = this.lightingReplacementService.getObjFromForm(this.form);
    this.checkSelectFixtureDiff();
    this.emitCalculate.emit(tmpObj);
  }

  focusField(str: string) {
    this.lightingReplacementService.selectedFixtureTypes.next(this.fixtureTypes);
    this.emitFocusField.emit(str);
  }

  removeFixture() {
    this.emitRemoveFixture.emit(this.index);
  }

  editFixtureName() {
    this.isEditingName = true;
  }

  doneEditingName() {
    this.isEditingName = false;
  }

  focusOut() {
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.lightingReplacementService.operatingHours = oppHours;
    this.form.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  setCategory() {
    this.fixtureTypes = this.lightingFixtureCategories.find(fixtureCategory => { return fixtureCategory.category == this.form.controls.category.value }).fixturesData;
    this.lightingReplacementService.selectedFixtureTypes.next(this.fixtureTypes);
    this.clearProperties();
  }

  setProperties() {
    let fixtureData: LightingFixtureData = this.fixtureTypes.find(fixtureType => { return fixtureType.type == this.form.controls.type.value });
    if (fixtureData != undefined) {
      this.form.patchValue({
        lampsPerFixture: fixtureData.lampsPerFixture,
        wattsPerLamp: fixtureData.wattsPerLamp,
        lumensPerLamp: fixtureData.lumensPerLamp,
        lampLife: fixtureData.lampLife,
        coefficientOfUtilization: fixtureData.coefficientOfUtilization,
        ballastFactor: fixtureData.ballastFactor,
        lumenDegradationFactor: fixtureData.lumenDegradationFactor
      });
    }
    this.calculate();
  }

  clearProperties() {
    this.form.patchValue({
      type: '',
      lampsPerFixture: undefined,
      wattsPerLamp: undefined,
      lumensPerLamp: 1,
      lampLife: undefined,
      coefficientOfUtilization: 1,
      ballastFactor: undefined,
      lumenDegradationFactor: 1
    });
    this.calculate();
  }

  showDetails() {
    this.displayDetails = true;
  }

  hideDetails() {
    this.displayDetails = false;
  }

  checkSelectFixtureDiff() {
    if (this.form.controls.category.value != 0) {
      let fixtureData: LightingFixtureData = this.fixtureTypes.find(fixtureType => { return fixtureType.type == this.form.controls.type.value });
      if (fixtureData != undefined && fixtureData.type != "") {
        this.indicateLampsPerFixtureDiff = fixtureData.lampsPerFixture != this.form.controls.lampsPerFixture.value;
        this.indicateWattsPerLampDiff = fixtureData.wattsPerLamp != this.form.controls.wattsPerLamp.value;
        this.indicateLumensPerLampDiff = fixtureData.lumensPerLamp != this.form.controls.lumensPerLamp.value;
        this.indicateCoefficientOfUtilizationDiff = fixtureData.coefficientOfUtilization != this.form.controls.coefficientOfUtilization.value;
        this.indicateBallastFactorDiff = fixtureData.ballastFactor != this.form.controls.ballastFactor.value;
        this.indicateLumenDegradationFactorDiff = fixtureData.lumenDegradationFactor != this.form.controls.lumenDegradationFactor.value;
      } else {
        this.setNotDiff();
      }
    } else {
      this.setNotDiff();
    }
    this.indicateFixtureTypeDiff = this.indicateLampsPerFixtureDiff || this.indicateWattsPerLampDiff || this.indicateLumensPerLampDiff || this.indicateCoefficientOfUtilizationDiff || this.indicateBallastFactorDiff || this.indicateLumenDegradationFactorDiff;
    this.cd.detectChanges();
  }

  setNotDiff() {
    this.indicateLampsPerFixtureDiff = false;
    this.indicateWattsPerLampDiff = false;
    this.indicateLumensPerLampDiff = false;
    this.indicateCoefficientOfUtilizationDiff = false;
    this.indicateBallastFactorDiff = false;
    this.indicateLumenDegradationFactorDiff = false;
  }
}
