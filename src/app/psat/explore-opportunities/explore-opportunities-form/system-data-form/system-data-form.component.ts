import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PSAT } from '../../../../shared/models/psat';
import { PsatService } from '../../../psat.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
@Component({
    selector: 'app-system-data-form',
    templateUrl: './system-data-form.component.html',
    styleUrls: ['./system-data-form.component.css']
})
export class SystemDataFormComponent implements OnInit {
    @Input()
    psat: PSAT;
    @Output('emitCalculate')
    emitCalculate = new EventEmitter<boolean>();
    @Output('changeField')
    changeField = new EventEmitter<string>();
    @Input()
    settings: Settings;
    @Input()
    exploreModIndex: number;

    showSystemData: boolean = false;
    showCost: boolean = false;
    showFlowRate: boolean = false;
    showOperatingFraction: boolean = false;
    showHead: boolean;


    costError1: string;
    costError2: string;
    flowRateError1: string;
    flowRateError2: string;
    opFractionError1: string;
    opFractionError2: string;
    constructor(private psatService: PsatService, private convertUnitsService: ConvertUnitsService) {

    }

    ngOnInit() {
        this.checkCost(1);
        this.checkCost(2);
        this.checkFlowRate(1);
        this.checkFlowRate(2);
        this.checkOpFraction(1);
        this.checkOpFraction(2);
    }

    toggleSystemData() {
        if (this.showSystemData == false) {
            this.showCost = false;
            this.showFlowRate = false;
            this.showHead = false;
            this.showOperatingFraction = false;
            this.toggleCost();
            this.toggleFlowRate();
            this.toggleHead();
            this.toggleOperatingFraction();
        }
    }

    toggleCost() {
        if (this.showCost == false) {
            this.psat.modifications[this.exploreModIndex].psat.inputs.cost_kw_hour = this.psat.inputs.cost_kw_hour;
            this.calculate();
        }
    }

    toggleHead() {
        if (this.showHead == false) {
            this.psat.modifications[this.exploreModIndex].psat.inputs.head = this.psat.inputs.head;
            this.calculate();
        }
    }

    toggleOperatingFraction() {
        if (this.showOperatingFraction == false) {
            this.psat.modifications[this.exploreModIndex].psat.inputs.operating_fraction = this.psat.inputs.operating_fraction;
            this.calculate();
        }
    }

    toggleFlowRate() {
        if (this.showFlowRate == false) {
            this.psat.modifications[this.exploreModIndex].psat.inputs.flow_rate = this.psat.inputs.flow_rate;
            this.calculate();
        }
    }

    calculate() {
        this.emitCalculate.emit(true);
    }

    focusField(str: string) {
        this.changeField.emit(str);
    }

    checkOpFraction(num: number) {
        this.calculate();
        let val;
        if (num == 1) {
            val = this.psat.inputs.operating_fraction;
        } else if (num == 2) {
            val = this.psat.modifications[this.exploreModIndex].psat.inputs.operating_fraction;
        }
        if (val > 1) {
            if (num == 1) {
                this.opFractionError1 = 'Operating fraction needs to be between 0 - 1';
            } else if (num == 2) {
                this.opFractionError2 = 'Operating fraction needs to be between 0 - 1';
            }
            return false;
        }
        else if (val < 0) {
            if (num == 1) {
                this.opFractionError1 = "Cannot have negative operating fraction";
            } else if (num == 2) {
                this.opFractionError2 = "Cannot have negative operating fraction";
            }
            return false;
        }
        else {
            if (num == 1) {
                this.opFractionError1 = null;
            } else if (num == 2) {
                this.opFractionError2 = null;
            }
            return true;
        }
    }
    checkFlowRate(num: number) {
        this.calculate();
        let tmp: any = {
            message: null,
            valid: null
        };
        if (num == 1) {
            if (this.psat.inputs.flow_rate) {
                tmp = this.psatService.checkFlowRate(this.psat.inputs.pump_style, this.psat.inputs.flow_rate, this.settings);
            } else {
                tmp.message = 'Flow Rate Required';
                tmp.valid = false;
            }
        } else {
            if (this.psat.modifications[this.exploreModIndex].psat.inputs.flow_rate) {
                tmp = this.psatService.checkFlowRate(this.psat.modifications[this.exploreModIndex].psat.inputs.pump_style, this.psat.modifications[this.exploreModIndex].psat.inputs.flow_rate, this.settings);
            } else {
                tmp.message = 'Flow Rate Required';
                tmp.valid = false;
            }
        }

        if (tmp.message) {
            if (num == 1) {
                this.flowRateError1 = tmp.message;
            } else {
                this.flowRateError2 = tmp.message;
            }
        } else {
            if (num == 1) {
                this.flowRateError1 = null;
            } else {
                this.flowRateError2 = null;
            }
        }
        return tmp.valid;
    }


    checkCost(num: number) {
        this.calculate();
        let val;
        if (num == 1) {
            val = this.psat.inputs.cost_kw_hour;
        } else {
            val = this.psat.modifications[this.exploreModIndex].psat.inputs.cost_kw_hour;
        }
        if (val < 0) {
            if (num == 1) {
                this.costError1 = 'Cannot have negative cost';
            } else {
                this.costError2 = 'Cannot have negative cost';
            }
            return false;
        } else if (val > 1) {
            if (num == 1) {
                this.costError1 = "Shouldn't be greater then 1";
            } else {
                this.costError2 = "Shouldn't be greater then 1";
            }
            return false;
        } else if (val >= 0 && val <= 1) {
            if (num == 1) {
                this.costError1 = null;
            } else {
                this.costError2 = null
            }
            return true;
        } else {
            if (num == 1) {
                this.costError1 = null;
            } else {
                this.costError2 = null
            }
            return null;
        }
    }


    getUnit(unit: string) {
        let tmpUnit = this.convertUnitsService.getUnit(unit);
        let dsp = tmpUnit.unit.name.display.replace('(', '');
        dsp = dsp.replace(')', '');
        return dsp;
    
    }

}