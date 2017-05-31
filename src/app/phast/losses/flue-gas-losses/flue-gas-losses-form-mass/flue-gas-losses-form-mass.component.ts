import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';

@Component({
  selector: 'app-flue-gas-losses-form-mass',
  templateUrl: './flue-gas-losses-form-mass.component.html',
  styleUrls: ['./flue-gas-losses-form-mass.component.css']
})
export class FlueGasLossesFormMassComponent implements OnInit {
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
    this.options = this.suiteDbService.selectFlueGasMaterialSolidLiquid();
    if (this.flueGasLossForm) {
      if (this.flueGasLossForm.value.gasTypeId && this.flueGasLossForm.value.gasTypeId != '') {
        if (this.flueGasLossForm.value.carbon == '') {
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

  enableForm() {
    this.elements = this.lossForm.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = false;
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

  setProperties() {
    let tmpFlueGas = this.suiteDbService.selectFlueGasMaterialSolidLiquidById(this.flueGasLossForm.value.gasTypeId);
    this.flueGasLossForm.patchValue({
      carbon: tmpFlueGas.carbon,
      hydrogen: tmpFlueGas.hydrogen,
      sulphur: tmpFlueGas.sulphur,
      inertAsh: tmpFlueGas.inertAsh,
      o2: tmpFlueGas.o2,
      moisture: tmpFlueGas.moisture,
      nitrogen: tmpFlueGas.nitrogen
    })
    this.checkForm();
  }

}
