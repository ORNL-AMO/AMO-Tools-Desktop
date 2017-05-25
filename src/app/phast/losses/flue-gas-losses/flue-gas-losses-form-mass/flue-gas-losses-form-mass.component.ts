import { Component, OnInit, Input } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';

@Component({
  selector: 'app-flue-gas-losses-form-mass',
  templateUrl: './flue-gas-losses-form-mass.component.html',
  styleUrls: ['./flue-gas-losses-form-mass.component.css']
})
export class FlueGasLossesFormMassComponent implements OnInit {
  @Input()
  flueGasLossForm: any;

  options: any;
  constructor(private suiteDbService: SuiteDbService) { }

  ngOnInit() {
    this.options = this.suiteDbService.selectFlueGasMaterialSolidLiquid();
  }

  setProperties(){
    
  }

}
