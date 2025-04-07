import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { WaterAssessmentService } from '../../../water-assessment.service';
import { HeatEnergyService } from './heat-energy.service';
import { HeatEnergy } from 'process-flow-lib';

@Component({
  selector: 'app-heat-energy',
  templateUrl: './heat-energy.component.html',
  styleUrl: './heat-energy.component.css'
})
export class HeatEnergyComponent {
  @Input()
  heatEnergy: HeatEnergy;
  @Output()
  updateHeatEnergy: EventEmitter<HeatEnergy> = new EventEmitter<HeatEnergy>();
  settings: Settings;
  form: FormGroup;
  isCollapsed: boolean = true;
  showBoilerEfficiencyModal: boolean = false;


  constructor(private waterAssessmentService: WaterAssessmentService,
    private heatEnergyService: HeatEnergyService) { }

  ngOnInit() {
    this.settings = this.waterAssessmentService.settings.getValue();
    this.initForm();
  }

  ngOnDestroy() { }

  initForm() {
    this.form = this.heatEnergyService.getHeatEnergyForm(this.heatEnergy);
  }

  save() {
    let updatedHeatEnergy: HeatEnergy = this.heatEnergyService.getHeatEnergyFromForm(this.form);
    this.updateHeatEnergy.emit(updatedHeatEnergy);
  }

  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  
  openBoilerEfficiencyModal() {
    this.showBoilerEfficiencyModal = true;
    this.waterAssessmentService.modalOpen.next(this.showBoilerEfficiencyModal);
  }

  closeBoilerEfficiencyModal() {
    this.showBoilerEfficiencyModal = false;
    this.waterAssessmentService.modalOpen.next(this.showBoilerEfficiencyModal)
  }

  setBoilerEfficiencyAndClose(efficiency: number) {
    this.form.controls.heaterEfficiency.patchValue(efficiency);
    this.closeBoilerEfficiencyModal();
  }

}

