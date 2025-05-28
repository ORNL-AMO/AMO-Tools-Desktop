import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EnergyEquivalencyElectric, EnergyEquivalencyFuel, EnergyEquivalencyElectricOutput, EnergyEquivalencyFuelOutput } from '../../../../shared/models/phast/energyEquivalency';
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { EnergyEquivalencyService } from '../energy-equivalency.service';

@Component({
    selector: 'app-energy-equivalency-form',
    templateUrl: './energy-equivalency-form.component.html',
    styleUrls: ['./energy-equivalency-form.component.css'],
    standalone: false
})
export class EnergyEquivalencyFormComponent implements OnInit {
  @Input()
  formElectric: UntypedFormGroup;
  @Input()
  formFuel: UntypedFormGroup;
  @Input()
  energyEquivalencyElectricOutput: EnergyEquivalencyElectricOutput;
  @Input()
  energyEquivalencyFuelOutput: EnergyEquivalencyFuelOutput;
  @Output('updateElectric')
  updateElectric = new EventEmitter<EnergyEquivalencyElectric>();
  @Output('updateFuel')
  updateFuel = new EventEmitter<EnergyEquivalencyFuel>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;
  energyEquivalencyElectric : EnergyEquivalencyElectric = {
    fuelFiredEfficiency: 0,
    electricallyHeatedEfficiency: 0,
    fuelFiredHeatInput: 0,
  };
  energyEquivalencyFuel : EnergyEquivalencyFuel = {
    fuelFiredEfficiency: 0,
    electricallyHeatedEfficiency: 0,
    electricalHeatInput: 0,
  };
  constructor(private energyEquivalencyService: EnergyEquivalencyService) { }

  ngOnInit() {
    this.formElectric = this.energyEquivalencyService.getElectricFormFromObj(this.energyEquivalencyElectric);
    this.formFuel = this.energyEquivalencyService.getFuelFormFromObj(this.energyEquivalencyFuel);
  }

  calcElectric() {
    let energyEquivalencyElectric: EnergyEquivalencyElectric = this.energyEquivalencyService.getElectricObjFromForm(this.formElectric);
    this.updateElectric.emit(energyEquivalencyElectric);
  }
  calcFuel() {
    let energyEquivalencyFuel: EnergyEquivalencyFuel = this.energyEquivalencyService.getFuelObjFromForm(this.formFuel);
    this.updateFuel.emit(energyEquivalencyFuel);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  focusOut() {
    this.changeField.emit('default');
  }
}
