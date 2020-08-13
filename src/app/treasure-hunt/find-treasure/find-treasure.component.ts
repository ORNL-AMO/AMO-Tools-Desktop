import { Component, OnInit, Input } from '@angular/core';
import { TreasureHunt } from '../../shared/models/treasure-hunt';
import { Settings } from '../../shared/models/settings';
import { CalculatorsService } from '../calculators/calculators.service';
import { Subscription } from 'rxjs';
import { TreasureHuntService } from '../treasure-hunt.service';

@Component({
  selector: 'app-find-treasure',
  templateUrl: './find-treasure.component.html',
  styleUrls: ['./find-treasure.component.css']
})
export class FindTreasureComponent implements OnInit {
  @Input()
  settings: Settings;

  showOpportunitySheetOnSave: boolean;
  displayCalculatorType: string = 'All';

  selectedCalcSubscription: Subscription;
  selectedCalc: string;
  treasureHunt: TreasureHunt;
  treasureHuntSub: Subscription;
  constructor(private calculatorsService: CalculatorsService, private treasureHuntService: TreasureHuntService) { }

  ngOnInit() {
    this.selectedCalcSubscription = this.calculatorsService.selectedCalc.subscribe(val => {
      this.selectedCalc = val;
    });
    this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
      this.treasureHunt = val;
    })
  }

  ngOnDestroy() {
    this.selectedCalcSubscription.unsubscribe();
    this.treasureHuntSub.unsubscribe();
  }

  selectLightingCalc() {
    this.calculatorsService.addNewLighting();
  }

  selectReplaceExisting(){
    this.calculatorsService.addNewReplaceExistingMotor();
  }

  selectMotorDrive(){
    this.calculatorsService.addNewMotorDrive();
  }

  selectNaturalGas(){
    this.calculatorsService.addNewNaturalGasReduction();
  }  

  selectElectricityReduction(){
    this.calculatorsService.addNewElectricityReduction();
  }

  selectCompressedAirReduction(){
    this.calculatorsService.addNewCompressedAirReduction();
  }

  selectCompressedAirPressureReduction(){
    this.calculatorsService.addNewCompressedAirPressureReductions();
  }

  selectWaterReduction(){
    this.calculatorsService.addNewWaterReduction();
  }

  selectOpportunitySheet(){
    this.calculatorsService.addNewOpportunitySheet();
  }

  selectSteamReduction(){
    this.calculatorsService.addNewSteamReduction();
  }

  selectPipeInsulationReduction(){
    this.calculatorsService.addNewPipeInsulationReduction();
  }

  selectTankInsulationReduction(){
    this.calculatorsService.addNewTankInsulationReduction();
  }

  selectAirLeakSurvey(){
    this.calculatorsService.addNewAirLeakSurvey()
  }
}
