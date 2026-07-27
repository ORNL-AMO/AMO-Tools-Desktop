import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges, HostListener, ChangeDetectorRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { LightingReplacementData } from '../../../../shared/models/lighting';
import { UntypedFormGroup } from '@angular/forms';
import { LightingReplacementService } from '../lighting-replacement.service';
import { OperatingHours } from '../../../../shared/models/operations';
import { LightingFixtureData } from '../../../../tools-suite-api/lighting-suite-api.service';
import { LightingSuiteApiService } from '../../../../tools-suite-api/lighting-suite-api.service';
import { LightingFixtureCategory } from '../../../../tools-suite-api/lighting-suite-api.service';
import { LightingFixtureMaterial } from '../../../../shared/models/materials';
import { Settings } from '../../../../shared/models/settings';
import { LightingFixtureServiceDbService } from '../../../../indexedDb/lighting-fixture-db.service';
import { firstValueFrom } from 'rxjs';
@Component({
    selector: 'app-lighting-replacement-form',
    templateUrl: './lighting-replacement-form.component.html',
    styleUrls: ['./lighting-replacement-form.component.css'],
    standalone: false
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
  @Input()
  settings: Settings
  @Input()
  baselineSelected: boolean;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;

  idString: string;
  isEditingName: boolean = false;
  existingMaterial: LightingFixtureMaterial;
  showModal: boolean = false;
  hasDeletedCustomMaterial: boolean = false
  editExistingMaterial: boolean;
  form: UntypedFormGroup;

  showOperatingHoursModal: boolean;

  lightingFixtureCategories: Array<LightingFixtureCategory>;
  fixtureTypes: Array<LightingFixtureData>;
  displayDetails: boolean = false;

  indicateLampsPerFixtureDiff: boolean = false;
  indicateWattsPerLampDiff: boolean = false;
  indicateLumensPerLampDiff: boolean = false;
  indicateCoefficientOfUtilizationDiff: boolean = false;
  indicateBallastFactorDiff: boolean = false;
  indicateLumenDegradationFactorDiff: boolean = false;
  indicateFixtureTypeDiff: boolean = false;

  constructor(private lightingReplacementService: LightingReplacementService, private cd: ChangeDetectorRef,
    private lightingSuiteApiService: LightingSuiteApiService, private lightingFixtureServiceDbService: LightingFixtureServiceDbService) {}

  ngOnInit() {
    this.lightingFixtureCategories = this.lightingSuiteApiService.getLightingSystems();
    this.displayDetails = this.lightingReplacementService.showAdditionalDetails;
    if (this.isBaseline) {
      this.idString = 'baseline_' + this.index;
    }
    else {
      this.idString = 'modification_' + this.index;
    }

    this.form = this.lightingReplacementService.getFormFromObj(this.data);
    this.fixtureTypes = this.lightingFixtureCategories.find(fixtureCategory => { return fixtureCategory.category == this.form.controls.category.value }).fixturesData;
    this.computeFixtureDiff();
    this.lightingReplacementService.selectedFixtureTypes.next(this.fixtureTypes);
    if (this.selected == false) {
      this.form.disable();
    }

    this.loadCustomFixtures().then(() => {
      if (this.form.controls.category.value === 0) {
        this.fixtureTypes = this.lightingFixtureCategories.find(fixtureCategory => fixtureCategory.category === 0).fixturesData;
        this.lightingReplacementService.selectedFixtureTypes.next(this.fixtureTypes);
        this.checkSelectFixtureDiff();
      }
    });
  }

  async loadCustomFixtures(): Promise<Array<LightingFixtureData>> {
    let customMaterials: Array<LightingFixtureMaterial> = await firstValueFrom(this.lightingFixtureServiceDbService.getAllCustomMaterials());
    let customFixturesData: Array<LightingFixtureData> = customMaterials.map(material => this.toLightingFixtureData(material));
    let customCategory: LightingFixtureCategory = this.lightingFixtureCategories.find(fixtureCategory => fixtureCategory.category === 0);
    customCategory.fixturesData = customFixturesData;
    return customFixturesData;
  }

  toLightingFixtureData(material: LightingFixtureMaterial): LightingFixtureData {
    return {
      category: material.category,
      type: material.type && material.type.trim() !== '' ? material.type : material.name,
      lampsPerFixture: material.lampsPerFixture,
      wattsPerLamp: material.wattsPerLamp,
      lumensPerLamp: material.lumensPerLamp,
      lampLife: material.lampLife,
      coefficientOfUtilization: material.coefficientOfUtilization,
      ballastFactor: material.ballastFactor,
      lumenDegradationFactor: material.lumenDegradationFactor
    };
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
    this.computeFixtureDiff();
    this.cd.detectChanges();
  }

  computeFixtureDiff() {
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
  }

  showMaterialModal(editExistingMaterial: boolean) {
    this.editExistingMaterial = editExistingMaterial;
    this.showModal = true;
    this.materialModal.show();
  }

  async hideMaterialModal(event?: LightingFixtureMaterial) {
    if (event) {
      await this.loadCustomFixtures();
      this.form.controls.category.setValue(0);
      this.fixtureTypes = this.lightingFixtureCategories.find(fixtureCategory => fixtureCategory.category === 0).fixturesData;
      this.lightingReplacementService.selectedFixtureTypes.next(this.fixtureTypes);
      this.form.controls.type.setValue(event.type && event.type.trim() !== '' ? event.type : event.name);
      this.setProperties();
    }
    this.showModal = false;
    this.dismissMessage();
    this.materialModal.hide();
  }

  dismissMessage() {
    this.hasDeletedCustomMaterial = false;
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
