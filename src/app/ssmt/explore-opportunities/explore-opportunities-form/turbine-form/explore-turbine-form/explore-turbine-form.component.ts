import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { PressureTurbine, CondensingTurbine } from '../../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../../shared/models/settings';
import { ExploreOpportunitiesService } from '../../../explore-opportunities.service';
import { UntypedFormGroup } from '@angular/forms';
import { SsmtService } from '../../../../ssmt.service';


@Component({
    selector: 'app-explore-turbine-form',
    templateUrl: './explore-turbine-form.component.html',
    styleUrls: ['./explore-turbine-form.component.css'],
    standalone: false
})
export class ExploreTurbineFormComponent implements OnInit {
  @Input()
  baselineForm: UntypedFormGroup;
  @Input()
  settings: Settings;
  @Input()
  modificationForm: UntypedFormGroup;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Input()
  turbineType: string;
  @Output('emitShowTurbine')
  emitShowTurbine = new EventEmitter<boolean>();
  @Input()
  showFormToggle: boolean;
  @Input()
  exploreModIndex: number;

  showUseTurbine: boolean;
  showGenerationEfficiency: boolean;
  showIsentropicEfficiency: boolean;
  showBaseline: boolean;
  constructor(private exploreOpportunitiesService: ExploreOpportunitiesService, private ssmtService: SsmtService) { }

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.showFormToggle && !changes.showFormToggle.isFirstChange()) {
      if (this.showFormToggle === false) {
        this.showUseTurbine = false;
        this.showGenerationEfficiency = false;
        this.showIsentropicEfficiency = false;
      }
    }
    
    if (changes.exploreModIndex && !changes.exploreModIndex.isFirstChange()) {
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
    this.showBaseline = this.baselineForm.controls.useTurbine.value;
  }

  initTurbineStatus() {
    if (this.baselineForm.controls.useTurbine.value !== this.modificationForm.controls.useTurbine.value) {
      this.showUseTurbine = true;
    } else {
      this.showUseTurbine = false;
    }
  }

  initIsentropicEfficiency() {
    if (this.baselineForm.controls.isentropicEfficiency.value !== this.modificationForm.controls.isentropicEfficiency.value) {
      this.showIsentropicEfficiency = true;
    } else {
      this.showIsentropicEfficiency = false;
    }
  }

  initGenerationEfficiency() {
    if (this.baselineForm.controls.generationEfficiency.value !== this.modificationForm.controls.generationEfficiency.value) {
      this.showGenerationEfficiency = true;
    } else {
      this.showGenerationEfficiency = false;
    }
  }

  toggleTurbineStatus() {
    if (this.showUseTurbine === false) {
      this.modificationForm.controls.useTurbine.patchValue(this.baselineForm.controls.useTurbine.value);
    }
  }

  toggleIsentropicEfficiency() {
    if (this.showIsentropicEfficiency === false) {
      this.modificationForm.controls.isentropicEfficiency.patchValue(this.baselineForm.controls.isentropicEfficiency.value);
    }
  }

  toggleGenerationEfficiency() {
    if (this.showGenerationEfficiency === false) {
      this.modificationForm.controls.generationEfficiency.patchValue(this.baselineForm.controls.generationEfficiency.value);
    }
  }

  save() {
    this.emitSave.emit(true);
  }

  focusField(str: string) {
    this.exploreOpportunitiesService.currentTab.next('turbine');
    this.ssmtService.isBaselineFocused.next(false);
    this.exploreOpportunitiesService.currentField.next(str);
  }

  focusOut() {
    // this.exploreOpportunitiesService.currentTab.next('turbine');
    // this.exploreOpportunitiesService.currentField.next('default');
  }

}
