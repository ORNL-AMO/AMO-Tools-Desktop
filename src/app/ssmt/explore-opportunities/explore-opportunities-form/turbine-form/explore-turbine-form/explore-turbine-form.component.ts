import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { PressureTurbine, CondensingTurbine } from '../../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../../shared/models/settings';
import { ExploreOpportunitiesService } from '../../../explore-opportunities.service';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'app-explore-turbine-form',
  templateUrl: './explore-turbine-form.component.html',
  styleUrls: ['./explore-turbine-form.component.css']
})
export class ExploreTurbineFormComponent implements OnInit {
  @Input()
  baselineForm: FormGroup;
  @Input()
  settings: Settings;
  @Input()
  modificationForm: FormGroup;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Input()
  turbineType: string;
  @Output('emitShowTurbine')
  emitShowTurbine = new EventEmitter<boolean>();
  @Input()
  showFormToggle: boolean;


  showUseTurbine: boolean;
  showGenerationEfficiency: boolean;
  showIsentropicEfficiency: boolean;
  
  constructor(private exploreOpportunitiesService: ExploreOpportunitiesService) { }

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes.showFormToggle && !changes.showFormToggle.isFirstChange()){
      if(this.showFormToggle == false){
        this.showUseTurbine = false;
        this.showGenerationEfficiency = false;
        this.showIsentropicEfficiency = false;
      }
    }
    
    if(changes.exploreModIndex && !changes.exploreModIndex.isFirstChange()){
      this.showUseTurbine = false;
      this.showGenerationEfficiency = false;
      this.showIsentropicEfficiency = false;
      this.initForm();
    }
  }

  initForm() {
    this.initIsentropicEfficiency();
    this.initTurbineStatus();
    this.initGenerationEfficiency();
    if (this.showUseTurbine || this.showIsentropicEfficiency || this.showGenerationEfficiency) {
      this.emitShowTurbine.emit(true);
    }
  }

  initTurbineStatus() {
    if (this.baselineForm.controls.useTurbine.value != this.modificationForm.controls.useTurbine.value) {
      this.showUseTurbine = true;
    }
  }

  initIsentropicEfficiency() {
    if (this.baselineForm.controls.isentropicEfficiency.value != this.modificationForm.controls.isentropicEfficiency.value) {
      this.showIsentropicEfficiency = true;
    }
  }

  initGenerationEfficiency() {
    if (this.baselineForm.controls.generationEfficiency.value != this.modificationForm.controls.generationEfficiency.value) {
      this.showGenerationEfficiency = true;
    }
  }

  toggleTurbineStatus() {
    if (this.showUseTurbine == false) {
      this.modificationForm.controls.useTurbine.patchValue(this.baselineForm.controls.useTurbine.value);
    }
  }

  toggleIsentropicEfficiency() {
    if (this.showIsentropicEfficiency == false) {
      this.modificationForm.controls.isentropicEfficiency.patchValue(this.baselineForm.controls.isentropicEfficiency);
    }
  }

  toggleGenerationEfficiency() {
    if (this.showGenerationEfficiency == false) {
      this.modificationForm.controls.generationEfficiency.patchValue(this.baselineForm.controls.generationEfficiency);
    }
  }

  save() {
    this.emitSave.emit(true);
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
