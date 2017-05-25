import { Component, OnInit, Input } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';

@Component({
  selector: 'app-flue-gas-losses-form-volume',
  templateUrl: './flue-gas-losses-form-volume.component.html',
  styleUrls: ['./flue-gas-losses-form-volume.component.css']
})
export class FlueGasLossesFormVolumeComponent implements OnInit {
  @Input()
  flueGasLossForm: any;


  options: any;
  constructor(private suiteDbService: SuiteDbService) { }

  ngOnInit() {
    this.options = this.suiteDbService.selectFlueGasMaterialGas();
  }

  setProperties(){
    this.flueGasLossForm.value.gasType;
    debugger;
  }

}
