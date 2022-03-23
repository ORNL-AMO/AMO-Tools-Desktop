import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../../indexedDb/settings-db.service';
import { FlueGasModalData } from '../../../../shared/models/phast/heatCascading';
import { FlueGas, FlueGasOutput } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasService } from '../flue-gas.service';

@Component({
  selector: 'app-flue-gas-modal',
  templateUrl: './flue-gas-modal.component.html',
  styleUrls: ['./flue-gas-modal.component.css']
})
export class FlueGasModalComponent implements OnInit {

  @Output('closeModal')
  closeModal = new EventEmitter<FlueGasModalData>();
  @Output('hideModal')
  hideModal = new EventEmitter();
  @Input()
  settings: Settings;
  @Input()
  hideSolidLiquidMaterial: boolean;
  @Input()
  treasureHuntEnergySource: string;
  @Input()
  inTreasureHunt: boolean;
  @Input()
  selectedFuelId: number;
  
  method: string = 'By Mass';
  baselineData: FlueGas;
  modificationData: FlueGas;
  baselineDataSub: Subscription;
  modificationDataSub: Subscription;
  outputSubscription: Subscription;
  output: FlueGasOutput;
  
  constructor(private settingsDbService: SettingsDbService, 
              private flueGasService: FlueGasService,
              private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.inTreasureHunt || this.hideSolidLiquidMaterial) {
      this.method = 'By Volume';
    }
    let existingInputs = this.flueGasService.baselineData.getValue();

    if (!existingInputs) {
        this.flueGasService.initDefaultEmptyOutput();
        this.flueGasService.initDefaultEmptyInputs();
    }
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.baselineDataSub.unsubscribe();
    this.modificationDataSub.unsubscribe();
    this.outputSubscription.unsubscribe();
  }

  initSubscriptions() {
    this.baselineDataSub = this.flueGasService.baselineData.subscribe(value => {
      this.flueGasService.calculate(this.settings, true);
    })
    this.modificationDataSub = this.flueGasService.modificationData.subscribe(value => {
      this.flueGasService.calculate(this.settings, true);
    })
    this.outputSubscription = this.flueGasService.output.subscribe(val => {
      if (val) {
        this.output = val;
        this.cd.detectChanges();
      }
    });
  }

  changeFuelType() {
    this.flueGasService.initDefaultEmptyOutput();
  }

  focusField(str: string) {
    this.flueGasService.currentField.next(str);
  }

  setFlueGasData() {
    let input: FlueGas = this.flueGasService.baselineData.getValue();
    let flueGasModalData: FlueGasModalData;
    if (input.flueGasType === 'By Mass') {
      flueGasModalData = {
        calculatedAvailableHeat: this.output.baseline.availableHeat,
        fuelTempF: input.flueGasByMass.fuelTemperature,
        ambientAirTempF: input.flueGasByMass.ambientAirTemp,
        combAirMoisturePerc: input.flueGasByMass.moistureInAirCombustion,
      };
    } else {
      flueGasModalData = {
        calculatedAvailableHeat: this.output.baseline.availableHeat,
        fuelTempF: input.flueGasByVolume.fuelTemperature,
        ambientAirTempF: input.flueGasByVolume.ambientAirTemp,
        combAirMoisturePerc: input.flueGasByVolume.moistureInAirCombustion,
      };
    }
    this.closeModal.emit(flueGasModalData);
  }

  hideMaterialModal() {
    this.hideModal.emit();
  }
}
