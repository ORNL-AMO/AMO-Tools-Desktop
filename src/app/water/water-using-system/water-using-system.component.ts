import { Component } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { WaterAssessment, WaterProcessComponent, WaterUsingSystem } from '../../shared/models/water-assessment';
import { Subscription } from 'rxjs';
import { WaterAssessmentService } from '../water-assessment.service';
import { WaterProcessComponentService } from '../water-system-component.service';
import { FormGroup } from '@angular/forms';
import * as _ from 'lodash';


@Component({
  selector: 'app-water-using-system',
  templateUrl: './water-using-system.component.html',
  styleUrl: './water-using-system.component.css'
})
export class WaterUsingSystemComponent {
  settings: Settings;
  selectedWaterUsingSystem: WaterUsingSystem;
  componentFormTitle: string;
  form: FormGroup;
  selectedComponentSub: Subscription;
  waterAssessment: WaterAssessment;
  constructor(private waterAssessmentService: WaterAssessmentService, private waterProcessComponentService: WaterProcessComponentService) {}

  ngOnInit() {
    this.settings = this.waterAssessmentService.settings.getValue();
    this.componentFormTitle = this.waterAssessmentService.setWaterProcessComponentTitle('water-using-system');
    
    this.selectedComponentSub = this.waterProcessComponentService.selectedComponent.subscribe(selectedComponent => {
      this.selectedWaterUsingSystem = selectedComponent as WaterUsingSystem;
      this.waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
      this.waterProcessComponentService.selectedViewComponents.next(this.waterAssessment.waterUsingSystems as WaterProcessComponent[]);
      if (this.selectedWaterUsingSystem) {
        this.initForm();
      }
    });
    this.setDefaultSelectedComponent();
  }

  ngOnDestroy() {
    this.selectedComponentSub.unsubscribe();
  }

  setDefaultSelectedComponent() {
    if (!this.selectedWaterUsingSystem || (this.selectedWaterUsingSystem && this.selectedWaterUsingSystem.processComponentType !== 'water-using-system')) {
      let lastModified: WaterProcessComponent = _.maxBy(this.waterAssessment.waterUsingSystems, 'modifiedDate');
      this.waterProcessComponentService.selectedComponent.next(lastModified);
    }
  }

  initForm() {
   this.form = this.waterProcessComponentService.getWaterUsingSystemForm(this.selectedWaterUsingSystem);
  }

  save() {
    let updated: WaterUsingSystem = this.waterProcessComponentService.getWaterUsingSystemFromForm(this.form, this.selectedWaterUsingSystem);
    let waterAssessment: WaterAssessment = this.waterAssessmentService.waterAssessment.getValue();
    let updateIndex: number = waterAssessment.waterUsingSystems.findIndex(process => process.diagramNodeId === updated.diagramNodeId);
    waterAssessment.waterUsingSystems[updateIndex] = updated;
    this.waterAssessmentService.waterAssessment.next(waterAssessment);
  }

  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }

  addWaterUsingSystem() {
    this.waterAssessmentService.addNewWaterComponent('water-using-system')
  }
}

