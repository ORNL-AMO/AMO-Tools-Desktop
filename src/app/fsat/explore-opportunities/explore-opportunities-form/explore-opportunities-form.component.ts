import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener, SimpleChanges } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { FSAT, InletPressureData, OutletPressureData, PlaneData, FanRatedInfo } from '../../../shared/models/fans';
import { HelpPanelService } from '../../help-panel/help-panel.service';
import { ModifyConditionsService } from '../../modify-conditions/modify-conditions.service';
import { FormGroup } from '@angular/forms';
import { FanFieldDataService } from '../../fan-field-data/fan-field-data.service';
import { FanMotorService } from '../../fan-motor/fan-motor.service';
import { FanSetupService } from '../../fan-setup/fan-setup.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FsatService } from '../../fsat.service';
import { FanFieldDataWarnings, FsatWarningService } from '../../fsat-warning.service';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-explore-opportunities-form',
  templateUrl: './explore-opportunities-form.component.html',
  styleUrls: ['./explore-opportunities-form.component.css']
})
export class ExploreOpportunitiesFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  fsat: FSAT;
  @Input()
  exploreModIndex: number;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Output('emitAddNewMod')
  emitAddNewMod = new EventEmitter<boolean>();

  @ViewChild('modalBody') public modalBody: ElementRef;
  @ViewChild('pressureModal') public pressureModal: ModalDirective;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getBodyHeight();
  }
  bodyHeight: number;

  baselineFieldDataForm: FormGroup;
  modificationFieldDataForm: FormGroup;

  baselineMotorForm: FormGroup;
  modificationMotorForm: FormGroup;

  baselineFanSetupForm: FormGroup;
  modificationFanSetupForm: FormGroup;
  baselineFanEfficiency: number;

  modificationFanFieldDataWarnings: FanFieldDataWarnings;
  baselineFanFieldDataWarnings: FanFieldDataWarnings;

  pressureCalcType: string;
  inletPressureCopy: InletPressureData;
  outletPressureCopy: OutletPressureData;
  pressureModalSub: Subscription;

  constructor(private helpPanelService: HelpPanelService, private modifyConditionsService: ModifyConditionsService, private fanFieldDataService: FanFieldDataService,
    private fanMotorService: FanMotorService, private fanSetupService: FanSetupService, private convertUnitsService: ConvertUnitsService, private fsatService: FsatService,
    private fsatWarningService: FsatWarningService) { }

  ngOnInit() {
    this.initForms();
    this.checkWarnings();
    this.pressureModalSub = this.pressureModal.onShown.subscribe(() => {
      this.getBodyHeight();
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.initForms()
      }
    }
  }

  ngOnDestroy() {
    this.pressureModalSub.unsubscribe();
    console.log(this.fsat.modifications[this.exploreModIndex].fsat.name);
    if (this.fsat.modifications[this.exploreModIndex] && !this.fsat.modifications[this.exploreModIndex].fsat.name) {
      this.fsat.modifications[this.exploreModIndex].fsat.name = 'Opportunities Modification';
      this.save();
    }
  }

  save() {
    this.saveFieldData();
    this.fsat.modifications[this.exploreModIndex].fsat.fanMotor = this.fanMotorService.getObjFromForm(this.modificationMotorForm);
    this.fsat.modifications[this.exploreModIndex].fsat.fanSetup = this.fanSetupService.getObjFromForm(this.modificationFanSetupForm);
    this.checkWarnings();
    this.emitSave.emit(true);
  }

  saveFieldData() {
    let tmpInletPressureData: InletPressureData = this.fsat.modifications[this.exploreModIndex].fsat.fieldData.inletPressureData;
    let tmpOutletPressureData: OutletPressureData = this.fsat.modifications[this.exploreModIndex].fsat.fieldData.outletPressureData;
    let tmpPlaneData: PlaneData = this.fsat.modifications[this.exploreModIndex].fsat.fieldData.planeData;
    let tmpfanRatedInfo: FanRatedInfo = this.fsat.modifications[this.exploreModIndex].fsat.fieldData.fanRatedInfo;
    let tmpCalcType: string = this.fsat.modifications[this.exploreModIndex].fsat.fieldData.pressureCalcResultType;
    this.fsat.modifications[this.exploreModIndex].fsat.fieldData = this.fanFieldDataService.getObjFromForm(this.modificationFieldDataForm);
    this.fsat.modifications[this.exploreModIndex].fsat.fieldData.inletPressureData = tmpInletPressureData;
    this.fsat.modifications[this.exploreModIndex].fsat.fieldData.outletPressureData = tmpOutletPressureData;
    this.fsat.modifications[this.exploreModIndex].fsat.fieldData.planeData = tmpPlaneData;
    this.fsat.modifications[this.exploreModIndex].fsat.fieldData.fanRatedInfo = tmpfanRatedInfo;
    this.fsat.modifications[this.exploreModIndex].fsat.fieldData.pressureCalcResultType = tmpCalcType;
  }

  initForms() {
    this.baselineFieldDataForm = this.fanFieldDataService.getFormFromObj(this.fsat.fieldData);
    this.baselineFieldDataForm.disable();
    this.modificationFieldDataForm = this.fanFieldDataService.getFormFromObj(this.fsat.modifications[this.exploreModIndex].fsat.fieldData);

    this.baselineMotorForm = this.fanMotorService.getFormFromObj(this.fsat.fanMotor);
    this.baselineMotorForm.disable();
    this.modificationMotorForm = this.fanMotorService.getFormFromObj(this.fsat.modifications[this.exploreModIndex].fsat.fanMotor);


    this.baselineFanSetupForm = this.fanSetupService.getFormFromObj(this.fsat.fanSetup, false);
    this.baselineFanSetupForm.disable();
    this.modificationFanSetupForm = this.fanSetupService.getFormFromObj(this.fsat.modifications[this.exploreModIndex].fsat.fanSetup, true);

    this.baselineFanEfficiency = this.fsatService.getResults(this.fsat, true, this.settings).fanEfficiency;
    this.baselineFanEfficiency = this.convertUnitsService.roundVal(this.baselineFanEfficiency, 2);
  }

  checkWarnings() {
    this.baselineFanFieldDataWarnings = this.fsatWarningService.checkFieldDataWarnings(this.fsat, this.settings, false);
    this.modificationFanFieldDataWarnings = this.fsatWarningService.checkFieldDataWarnings(this.fsat.modifications[this.exploreModIndex].fsat, this.settings, true);
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
    this.modifyConditionsService.modifyConditionsTab.next('fan-field-data')
  }

  addNewMod() {
    this.emitAddNewMod.emit(true);
  }

  setVFD(){
    if(this.fsat.modifications[this.exploreModIndex].fsat.isVFD){
      this.modificationFanSetupForm.controls.drive.patchValue(4);
      this.modificationFanSetupForm.controls.specifiedDriveEfficiency.patchValue(95);
    }else{
      this.modificationFanSetupForm.controls.drive.patchValue(this.baselineFanSetupForm.controls.drive.value);
      this.modificationFanSetupForm.controls.specifiedDriveEfficiency.patchValue(95);
    }
    this.save();
  }


  openPressureModal(str: string) {
    if (this.fsat.modifications[this.exploreModIndex].fsat.fieldData.inletPressureData) {
      this.inletPressureCopy = JSON.parse(JSON.stringify(this.fsat.modifications[this.exploreModIndex].fsat.fieldData.inletPressureData));
    }
    if (this.fsat.modifications[this.exploreModIndex].fsat.fieldData.outletPressureData) {
      this.outletPressureCopy = JSON.parse(JSON.stringify(this.fsat.modifications[this.exploreModIndex].fsat.fieldData.outletPressureData));
    }
    this.pressureCalcType = str;
    this.fsatService.modalOpen.next(true);
    this.pressureModal.show();
  }

  hidePressureModal() {
    this.pressureModal.hide();
  }

  saveAndClose() {
    if (this.pressureCalcType == 'inlet') {
      this.saveInletPressure(this.inletPressureCopy);
    } else if (this.pressureCalcType == 'outlet') {
      this.saveOutletPressure(this.outletPressureCopy);
    }
    this.hidePressureModal();
  }

  saveInletPressure(inletPressureData: InletPressureData) {
    this.inletPressureCopy = inletPressureData;
    if (this.inletPressureCopy) {
      this.fsat.modifications[this.exploreModIndex].fsat.fieldData.inletPressureData = inletPressureData;
      this.modificationFieldDataForm.patchValue({
        inletPressure: this.fsat.modifications[this.exploreModIndex].fsat.fieldData.inletPressureData.calculatedInletPressure
      })
      this.save();
    }
  }

  saveOutletPressure(outletPressureData: OutletPressureData) {
    this.outletPressureCopy = outletPressureData;
    if (this.outletPressureCopy) {
      this.fsat.modifications[this.exploreModIndex].fsat.fieldData.outletPressureData = outletPressureData;
      this.modificationFieldDataForm.patchValue({
        outletPressure: this.fsat.modifications[this.exploreModIndex].fsat.fieldData.outletPressureData.calculatedOutletPressure
      });
      this.save();
    }
  }

  getBodyHeight() {
    if (this.modalBody) {
      this.bodyHeight = this.modalBody.nativeElement.clientHeight;
    } else {
      this.bodyHeight = 0;
    }
  }
}
