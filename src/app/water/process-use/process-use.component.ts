import { Component } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { ProcessUse, WaterProcessComponent } from '../../shared/models/water-assessment';
import { WaterAssessmentService } from '../water-assessment.service';
import { FormGroup } from '@angular/forms';
import { WaterProcessComponentService } from '../water-system-component.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-process-use',
  templateUrl: './process-use.component.html',
  styleUrl: './process-use.component.css'
})
export class ProcessUseComponent {
  settings: Settings;
  processUses: ProcessUse[];
  selectedProcessUse: ProcessUse;
  form: FormGroup;
  selectedComponentSub: Subscription;
  constructor(private waterAssessmentService: WaterAssessmentService, private waterProcessComponentService: WaterProcessComponentService) {}

  ngOnInit() {
    this.settings = this.waterAssessmentService.settings.getValue();
    let waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
    this.processUses = waterAssessment.processUses;
    this.setSelectedComponent();
    if (this.processUses) {
      this.waterProcessComponentService.selectedViewComponents.next(this.processUses);
    }

    this.selectedComponentSub = this.waterProcessComponentService.selectedComponent.subscribe(val => {
      this.selectedProcessUse = val;
      console.log('process selectedProcessUse', this.selectedProcessUse)
      this.initForm();
    })

  }

  ngOnDestroy() {
    this.selectedComponentSub.unsubscribe();
  }

  setSelectedComponent() {
    let selectedComponent: WaterProcessComponent = this.waterProcessComponentService.selectedComponent.getValue();
    if (!selectedComponent || (selectedComponent && selectedComponent.processComponentType !== 'processUse')) {
      let lastModified: WaterProcessComponent = _.maxBy(this.processUses, 'modifiedDate');
      this.waterProcessComponentService.selectedComponent.next(lastModified);

    }
  }

  initForm() {}

  save() {}

  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }

  removeProcess() {}

  toggleCollapse() {}

  addProcessUse() {}
}

