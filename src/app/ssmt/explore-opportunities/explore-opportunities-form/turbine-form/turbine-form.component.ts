import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { SSMT, PressureTurbine, CondensingTurbine } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';
import { ExploreOpportunitiesService } from '../../explore-opportunities.service';
import { TurbineService } from '../../../turbine/turbine.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-turbine-form',
  templateUrl: './turbine-form.component.html',
  styleUrls: ['./turbine-form.component.css']
})
export class TurbineFormComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('emitSave')
  emitSave = new EventEmitter<SSMT>();


  showCondensingTurbine: boolean = false;
  showHighToLowPressureTurbine: boolean = false;
  showHighToMediumPressureTurbine: boolean = false;
  showMediumToLowPressureTurbine: boolean = false;
  
  baselineCondensingTurbineForm: FormGroup;
  modificationCondensingTurbineForm: FormGroup;
  
  baselineHighToLowTurbineForm: FormGroup;
  modificationHighToLowTurbineForm: FormGroup;
  
  baselineHighToMediumForm: FormGroup;
  modificationHighToMediumForm: FormGroup;
  
  baselineMediumToLowForm: FormGroup;
  modificationMediumToLowForm: FormGroup;
  constructor(private exploreOpportunitiesService: ExploreOpportunitiesService, private cd: ChangeDetectorRef, private turbineService: TurbineService) { }
  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex && !changes.exploreModIndex.isFirstChange()) {
      this.showCondensingTurbine = false;
      this.showHighToLowPressureTurbine = false;
      this.showHighToMediumPressureTurbine = false;
      this.showMediumToLowPressureTurbine = false;
      this.initForm();
    }
  }

  initForm() {
    if (this.ssmt.turbineInput.condensingTurbine) {
      this.baselineCondensingTurbineForm = this.turbineService.getCondensingFormFromObj(this.ssmt.turbineInput.condensingTurbine, this.settings);
      this.modificationCondensingTurbineForm = this.turbineService.getCondensingFormFromObj(this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.condensingTurbine, this.settings);
    } else {
      this.baselineCondensingTurbineForm = this.turbineService.initCondensingTurbineForm(this.settings);
      this.modificationCondensingTurbineForm = this.turbineService.initCondensingTurbineForm(this.settings);
    }
    this.baselineCondensingTurbineForm.disable();


    if (this.ssmt.headerInput.numberOfHeaders >= 2) {
      if (this.ssmt.turbineInput.highToLowTurbine) {
        this.baselineHighToLowTurbineForm = this.turbineService.getPressureFormFromObj(this.ssmt.turbineInput.highToLowTurbine);
        this.modificationHighToLowTurbineForm = this.turbineService.getPressureFormFromObj(this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.highToLowTurbine);
      } else {
        this.baselineHighToLowTurbineForm = this.turbineService.initPressureForm();
        this.modificationHighToLowTurbineForm = this.turbineService.initPressureForm();
      }
      this.baselineHighToLowTurbineForm.disable();
    }

    if (this.ssmt.headerInput.numberOfHeaders >= 3) {

      if (this.ssmt.turbineInput.highToMediumTurbine) {
        this.baselineHighToMediumForm = this.turbineService.getPressureFormFromObj(this.ssmt.turbineInput.highToMediumTurbine);
        this.modificationHighToMediumForm = this.turbineService.getPressureFormFromObj(this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.highToMediumTurbine);
      } else {
        this.baselineHighToMediumForm = this.turbineService.initPressureForm();
        this.modificationHighToMediumForm = this.turbineService.initPressureForm();
      }
      this.baselineHighToMediumForm.disable();

      if (this.ssmt.turbineInput.mediumToLowTurbine) {
        this.baselineMediumToLowForm = this.turbineService.getPressureFormFromObj(this.ssmt.turbineInput.mediumToLowTurbine);
        this.modificationMediumToLowForm = this.turbineService.getPressureFormFromObj(this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.mediumToLowTurbine);
      } else {
        this.baselineMediumToLowForm = this.turbineService.initPressureForm();
        this.modificationMediumToLowForm = this.turbineService.initPressureForm();
      }
      this.baselineMediumToLowForm.disable();
    }
  }



  toggleCondensingTurbine() {
    this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.condensingTurbine = this.ssmt.turbineInput.condensingTurbine;
    this.modificationCondensingTurbineForm = this.turbineService.getCondensingFormFromObj(this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.condensingTurbine, this.settings);
    this.save();
    this.cd.detectChanges();
  }

  toggleHighPressureToLowPressure() {
    this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.highToLowTurbine = this.ssmt.turbineInput.highToLowTurbine;
    this.modificationHighToLowTurbineForm = this.turbineService.getPressureFormFromObj(this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.highToLowTurbine);
    this.save();
    this.cd.detectChanges();

  }

  toggleHighPressureToMediumPressure() {
    this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.highToMediumTurbine = this.ssmt.turbineInput.highToMediumTurbine;
    this.modificationHighToMediumForm = this.turbineService.getPressureFormFromObj(this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.highToMediumTurbine);
    this.save();
    this.cd.detectChanges();

  }

  toggleMediumPressureToLowPressure() {
    this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.mediumToLowTurbine = this.ssmt.turbineInput.mediumToLowTurbine;
    this.modificationMediumToLowForm = this.turbineService.getPressureFormFromObj(this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.mediumToLowTurbine);
    this.save();
    this.cd.detectChanges();

  }

  setShowCondensingTurbine(showTurbine: boolean) {
    this.showCondensingTurbine = showTurbine;
    this.cd.detectChanges();
  }

  setShowHighLowTurbine(showTurbine: boolean) {
    this.showHighToLowPressureTurbine = showTurbine;
    this.cd.detectChanges();
  }

  setShowHighMediumTurbine(showTurbine: boolean) {
    this.showHighToMediumPressureTurbine = showTurbine;
    this.cd.detectChanges();
  }

  setShowMediumLowTurbine(showTurbine: boolean) {
    this.showMediumToLowPressureTurbine = showTurbine;
    this.cd.detectChanges();
  }

  save() {
    this.emitSave.emit(this.ssmt);
  }

  saveHighToLowTurbine(){
    let tmpHighToLowTurbine: PressureTurbine = this.turbineService.getPressureTurbineFromForm(this.modificationHighToLowTurbineForm);
    this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.highToLowTurbine = tmpHighToLowTurbine;
    this.save();
  }

  saveHighToMediumTurbine(){
    let tmpHighToMediumTurbine: PressureTurbine = this.turbineService.getPressureTurbineFromForm(this.modificationHighToMediumForm);
    this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.highToMediumTurbine = tmpHighToMediumTurbine;
    this.save();
  }

  saveMediumToLowTurbine(){
    let tmpMediumToLowTurbine: PressureTurbine = this.turbineService.getPressureTurbineFromForm(this.modificationMediumToLowForm);
    this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.mediumToLowTurbine = tmpMediumToLowTurbine;
    this.save();
  }

  // savePressureTurbine(saveData: { baselineTurbine: PressureTurbine, modificationTurbine: PressureTurbine }, turbineStr: string) {
  //   this.ssmt.turbineInput[turbineStr] = saveData.baselineTurbine;
  //   this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput[turbineStr] = saveData.modificationTurbine;
  //   this.save();
  // }

  // saveExploreTurbine(saveData: { baselineTurbine: PressureTurbine | CondensingTurbine, modificationTurbine: PressureTurbine | CondensingTurbine }, turbineStr: string) {
  //   this.ssmt.turbineInput[turbineStr] = saveData.baselineTurbine;
  //   this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput[turbineStr] = saveData.modificationTurbine;
  //   this.save();
  // }

  saveCondensingTurbine() {
    //not needed unless enable changing baseline
    // let tmpBaselineTurbine: CondensingTurbine = this.turbineService.getCondensingTurbineFromForm(this.baselineCondensingTurbineForm);
    // this.ssmt.turbineInput.condensingTurbine = tmpBaselineTurbine;
    let tmpModificationTurbine: CondensingTurbine = this.turbineService.getCondensingTurbineFromForm(this.modificationCondensingTurbineForm);
    this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.condensingTurbine = tmpModificationTurbine;
    this.save();
  }

  focusField(str: string) {
    this.exploreOpportunitiesService.currentTab.next('turbine');
    this.exploreOpportunitiesService.currentField.next(str);
  }

  focusOut() {
    // this.exploreOpportunitiesService.currentTab.next('turbine');
    // this.exploreOpportunitiesService.currentField.next('default');
  }
}
