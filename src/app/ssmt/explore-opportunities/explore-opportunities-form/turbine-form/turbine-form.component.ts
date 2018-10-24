import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { SSMT, PressureTurbine, CondensingTurbine } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';
import { ExploreOpportunitiesService } from '../../explore-opportunities.service';
import { TurbineService } from '../../../turbine/turbine.service';

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
    if (!this.ssmt.turbineInput.condensingTurbine) {
      this.ssmt.turbineInput.condensingTurbine = this.turbineService.initCondensingTurbineObj();
      this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.condensingTurbine = this.turbineService.initCondensingTurbineObj();
    }
    if (!this.ssmt.turbineInput.highToLowTurbine) {
      this.ssmt.turbineInput.highToLowTurbine = this.turbineService.initPressureTurbine();
      this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.highToLowTurbine = this.turbineService.initPressureTurbine();
    }
    if (!this.ssmt.turbineInput.highToMediumTurbine) {
      this.ssmt.turbineInput.highToMediumTurbine = this.turbineService.initPressureTurbine();
      this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.highToMediumTurbine = this.turbineService.initPressureTurbine();
    }
    if (!this.ssmt.turbineInput.mediumToLowTurbine) {
      this.ssmt.turbineInput.mediumToLowTurbine = this.turbineService.initPressureTurbine();
      this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.mediumToLowTurbine = this.turbineService.initPressureTurbine();
    }
  }



  toggleCondensingTurbine() {
    this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.condensingTurbine = this.ssmt.turbineInput.condensingTurbine;
    this.save();
    this.cd.detectChanges();
  }

  toggleHighPressureToLowPressure() {
    this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.highToLowTurbine = this.ssmt.turbineInput.highToLowTurbine;
    this.save();
    this.cd.detectChanges();

  }

  toggleHighPressureToMediumPressure() {
    this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.highToMediumTurbine = this.ssmt.turbineInput.highToMediumTurbine;
    this.save();
    this.cd.detectChanges();

  }

  toggleMediumPressureToLowPressure() {
    this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.mediumToLowTurbine = this.ssmt.turbineInput.mediumToLowTurbine;
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

  save(newSSMT?: SSMT) {
    if (newSSMT) {
      this.ssmt = newSSMT;
    }
    this.emitSave.emit(this.ssmt);
  }

  savePressureTurbine(saveData: { baselineTurbine: PressureTurbine, modificationTurbine: PressureTurbine }, turbineStr: string) {
    this.ssmt.turbineInput[turbineStr] = saveData.baselineTurbine;
    this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput[turbineStr] = saveData.modificationTurbine;
    this.save();
  }

  saveExploreTurbine(saveData: { baselineTurbine: PressureTurbine | CondensingTurbine, modificationTurbine: PressureTurbine | CondensingTurbine }, turbineStr: string) {
    this.ssmt.turbineInput[turbineStr] = saveData.baselineTurbine;
    this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput[turbineStr] = saveData.modificationTurbine;
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
