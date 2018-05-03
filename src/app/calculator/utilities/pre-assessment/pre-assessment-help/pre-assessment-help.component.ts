import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pre-assessment-help',
  templateUrl: './pre-assessment-help.component.html',
  styleUrls: ['./pre-assessment-help.component.css']
})
export class PreAssessmentHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  currentEnergySourceType: string;
  @Input()
  currentAssessmentType: string;
  @Input()
  calcType: string;

  showElectricity: boolean = false;
  showSteam: boolean = false;
  showFuel: boolean = false;
  showDescription: boolean = false;
  constructor() { }

  ngOnInit() {
  }


  ngOnChanges(){
    if(this.calcType != 'pump'){
      this.showDescription = true;
    }else{
      this.showDescription = false;
    }

    if(this.currentEnergySourceType == 'Electricity'){
      this.showElectricity = true;
      this.showSteam = false;
      this.showFuel = false;
    }else if(this.currentEnergySourceType == 'Fuel'){
      this.showElectricity = false;
      this.showSteam = false;
      this.showFuel = true;
    }else if(this.currentEnergySourceType == 'Steam'){
      this.showElectricity = false;
      this.showSteam = true;
      this.showFuel = false;
    }else if(this.currentEnergySourceType == 'Hybrid'){
      if(this.currentField != 'kwRating'){
        this.showElectricity = false;
        this.showSteam = false;
        this.showFuel = true;
      }else{

        this.showElectricity = true;
        this.showSteam = false;
        this.showFuel = false;
      }
    }
    // console.log(this.currentField);
  }
}
