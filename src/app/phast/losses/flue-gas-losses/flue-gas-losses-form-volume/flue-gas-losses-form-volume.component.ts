import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';

@Component({
  selector: 'app-flue-gas-losses-form-volume',
  templateUrl: './flue-gas-losses-form-volume.component.html',
  styleUrls: ['./flue-gas-losses-form-volume.component.css']
})
export class FlueGasLossesFormVolumeComponent implements OnInit {
  @Input()
  flueGasLossForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  lossState: any;
  @Input()
  baselineSelected: boolean;
  @Output('changeField')
  changeField = new EventEmitter<string>();

  @ViewChild('lossForm') lossForm: ElementRef;
  form: any;
  elements: any;


  firstChange: boolean = true;
  options: any;
  constructor(private suiteDbService: SuiteDbService) { }

  ngOnInit() {
    this.options = this.suiteDbService.selectFlueGasMaterialGas();
    if (this.flueGasLossForm) {
      if (this.flueGasLossForm.value.gasTypeId && this.flueGasLossForm.value.gasTypeId != '') {
        if (this.flueGasLossForm.value.CH4 == '') {
          this.setProperties();
        }
      }
    }
    if (!this.baselineSelected) {
      this.disableForm();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (!this.baselineSelected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    } else {
      this.firstChange = false;
    }
  }

  disableForm() {
    this.elements = this.lossForm.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = true;
    }
  }

  checkForm() {
    this.lossState.saved = false;
    if (this.flueGasLossForm.status == "VALID") {
      this.calculate.emit(true);
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  enableForm() {
    this.elements = this.lossForm.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = false;
    }
  }

  setProperties() {
    let tmpFlueGas = this.suiteDbService.selectFlueGasMaterialGasById(this.flueGasLossForm.value.gasTypeId);
    this.flueGasLossForm.patchValue({
      CH4: tmpFlueGas.CH4,
      C2H6: tmpFlueGas.C2H6,
      N2: tmpFlueGas.N2,
      H2: tmpFlueGas.H2,
      C3H8: tmpFlueGas.C3H8,
      C4H10_CnH2n: tmpFlueGas.C4H10_CnH2n,
      H2O: tmpFlueGas.H2O,
      CO: tmpFlueGas.CO,
      CO2: tmpFlueGas.CO2,
      SO2: tmpFlueGas.SO2,
      O2: tmpFlueGas.O2
    })
    this.checkForm();
  }

}
