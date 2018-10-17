import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { PressureTurbine, CondensingTurbine } from '../../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../../shared/models/settings';
import { ExploreOpportunitiesService } from '../../../explore-opportunities.service';


@Component({
  selector: 'app-explore-turbine-form',
  templateUrl: './explore-turbine-form.component.html',
  styleUrls: ['./explore-turbine-form.component.css']
})
export class ExploreTurbineFormComponent implements OnInit {
  @Input()
  baselineTurbine: PressureTurbine | CondensingTurbine;
  @Input()
  settings: Settings;
  @Input()
  modificationTurbine: PressureTurbine | CondensingTurbine;
  @Output('emitSave')
  emitSave = new EventEmitter<{baselineTurbine: PressureTurbine | CondensingTurbine, modificationTurbine: PressureTurbine | CondensingTurbine}>();
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
    if (this.baselineTurbine.useTurbine != this.modificationTurbine.useTurbine) {
      this.showUseTurbine = true;
    }
  }

  initIsentropicEfficiency() {
    if (this.baselineTurbine.isentropicEfficiency != this.modificationTurbine.isentropicEfficiency) {
      this.showIsentropicEfficiency = true;
    }
  }

  initGenerationEfficiency() {
    if (this.baselineTurbine.generationEfficiency != this.modificationTurbine.generationEfficiency) {
      this.showGenerationEfficiency = true;
    }
  }

  toggleTurbineStatus() {
    if (this.showUseTurbine == false) {
      this.modificationTurbine.useTurbine = this.baselineTurbine.useTurbine;
    }
  }

  toggleIsentropicEfficiency() {
    if (this.showIsentropicEfficiency == false) {
      this.modificationTurbine.isentropicEfficiency = this.baselineTurbine.isentropicEfficiency;
    }
  }

  toggleGenerationEfficiency() {
    if (this.showGenerationEfficiency == false) {
      this.modificationTurbine.generationEfficiency = this.baselineTurbine.generationEfficiency;
    }
  }

  save() {
    this.emitSave.emit({baselineTurbine: this.baselineTurbine, modificationTurbine: this.modificationTurbine});
  }

  focusField(str: string) {
    this.exploreOpportunitiesService.currentTab.next('turbine');
    this.exploreOpportunitiesService.currentField.next(str);
  }

  focusOut() {
    this.exploreOpportunitiesService.currentTab.next('turbine');
    this.exploreOpportunitiesService.currentField.next('default');
  }

}
