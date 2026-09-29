import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { WaterAssessmentService } from '../../../water-assessment.service';
import { HeatEnergyService } from './heat-energy.service';
import { HeatEnergy, WaterSystemBasics, getHeatEnergyCost, getHeatEnergyKWh } from 'process-flow-lib';

@Component({
  selector: 'app-heat-energy',
  standalone: false,
  templateUrl: './heat-energy.component.html',
  styleUrl: './heat-energy.component.css'
})
export class HeatEnergyComponent {
  @Input()
  heatEnergy: HeatEnergy;
  @Input()
  systemWaterUse: number;
  @Output()
  updateHeatEnergy: EventEmitter<HeatEnergy> = new EventEmitter<HeatEnergy>();
  settings: Settings;
  form: FormGroup;
  isCollapsed: boolean = true;
  showBoilerEfficiencyModal: boolean = false;
  energyPerHour: number = 0;
  annualCost: number = 0;


  constructor(private waterAssessmentService: WaterAssessmentService,
    private heatEnergyService: HeatEnergyService) { }

  ngOnInit() {
    this.settings = this.waterAssessmentService.settings.getValue();
    this.initForm();
    this.setEnergyResults();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.systemWaterUse && !changes.systemWaterUse.firstChange) {
      this.setEnergyResults();
    }
  }

  ngOnDestroy() { }

  initForm() {
    this.form = this.heatEnergyService.getHeatEnergyForm(this.heatEnergy);
  }

  save() {
    let updatedHeatEnergy: HeatEnergy = this.heatEnergyService.getHeatEnergyFromForm(this.form);
    this.updateHeatEnergy.emit(updatedHeatEnergy);
    this.setEnergyResults();
  }

  setEnergyResults() {
    const heatEnergy: HeatEnergy = { ...this.heatEnergyService.getHeatEnergyFromForm(this.form), systemWaterUse: this.systemWaterUse ?? 0 };
    const systemBasics: WaterSystemBasics = this.waterAssessmentService.waterAssessment.getValue()?.systemBasics;
    const unitCost: number = heatEnergy.heatingFuelType === 0 ? systemBasics?.electricityCost : systemBasics?.fuelCost;
    const hoursPerYear: number = heatEnergy.hoursPerYear || 8760;
    this.energyPerHour = getHeatEnergyKWh(heatEnergy, this.settings.unitsOfMeasure) / hoursPerYear;
    this.annualCost = getHeatEnergyCost(heatEnergy, unitCost ?? 0, this.settings.unitsOfMeasure);
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

