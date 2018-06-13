import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FSAT } from '../../../../shared/models/fans';
import { FsatService } from '../../../fsat.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { HelpPanelService } from '../../../help-panel/help-panel.service';
import { ModifyConditionsService } from '../../../modify-conditions/modify-conditions.service';

@Component({
    selector: 'app-system-data-form',
    templateUrl: './system-data-form.component.html',
    styleUrls: ['./system-data-form.component.css']
})
export class SystemDataFormComponent implements OnInit {
    @Input()
    settings: Settings;
    @Input()
    exploreModIndex: number;
    @Input()
    fsat: FSAT;
    @Output('emitCalculate')
    emitCalculate = new EventEmitter<boolean>();

    showSystemData: boolean = false;
    showCost: boolean = false;
    showFlowRate: boolean = false;
    showOperatingFraction: boolean = false;
    showPressure: boolean = false;
    showName: boolean = false;

    costError1: string = null;
    costError2: string = null;
    flowRateError1: string = null;
    flowRateError2: string = null;
    opFractionError1: string = null;
    opFractionError2: string = null;
    pressureError1: string = null;
    pressureError2: string = null;
    tmpBaselineName: string = 'Baseline';
    constructor(private convertUnitsService: ConvertUnitsService, private helpPanelService: HelpPanelService, private modifyConditionsService: ModifyConditionsService) {
    }

    ngOnInit() {
        this.init();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.exploreModIndex) {
            if (!changes.exploreModIndex.isFirstChange()) {
                this.init()
            }
        }
    }

    init() {
        this.initCost();
        this.initFlowRate();
        this.initPressure();
        this.initOpFraction();
        this.initSystemData();

        this.checkCost(1);
        this.checkCost(2);
        this.checkFlowRate(1);
        this.checkFlowRate(2);
        this.checkOpFraction(1);
        this.checkOpFraction(2);
        this.checkPressure(1);
        this.checkPressure(2);
    }

    initCost() {
        if (this.fsat.fieldData.cost != this.fsat.modifications[this.exploreModIndex].fsat.fieldData.cost) {
            this.showCost = true;
        } else {
            this.showCost = false;
        }
    }

    initFlowRate() {
        if (this.fsat.fieldData.flowRate != this.fsat.modifications[this.exploreModIndex].fsat.fieldData.flowRate) {
            this.showFlowRate = true;
        } else {
            this.showFlowRate = false;
        }
    }

    initPressure() {
        if (this.fsat.fieldData.inletPressure != this.fsat.modifications[this.exploreModIndex].fsat.fieldData.inletPressure ||
            this.fsat.fieldData.outletPressure != this.fsat.modifications[this.exploreModIndex].fsat.fieldData.outletPressure) {
            this.showPressure = true;
        } else {
            this.showPressure = false;
        }
    }

    initOpFraction() {
        if (this.fsat.fieldData.operatingFraction != this.fsat.modifications[this.exploreModIndex].fsat.fieldData.operatingFraction) {
            this.showOperatingFraction = true;
        } else {
            this.showOperatingFraction = false;
        }
    }

    initSystemData() {
        if (this.showCost || this.showFlowRate || this.showPressure || this.showOperatingFraction) {
            this.showSystemData = true;
        } else {
            this.showSystemData = false;
        }
    }

    toggleSystemData() {
        if (this.showSystemData == false) {
            this.showCost = false;
            this.showFlowRate = false;
            this.showPressure = false;
            this.showOperatingFraction = false;
            this.toggleCost();
            this.toggleFlowRate();
            this.togglePressure();
            this.toggleOperatingFraction();
        }
    }

    toggleCost() {
        if (this.showCost == false) {
            this.fsat.modifications[this.exploreModIndex].fsat.fieldData.cost = this.fsat.fieldData.cost;
            this.calculate();
        }
    }

    togglePressure() {
        if (this.showPressure == false) {
            this.fsat.modifications[this.exploreModIndex].fsat.fieldData.inletPressure = this.fsat.fieldData.inletPressure;
            this.fsat.modifications[this.exploreModIndex].fsat.fieldData.outletPressure = this.fsat.fieldData.outletPressure;
            this.calculate();
        }
    }

    toggleOperatingFraction() {
        if (this.showOperatingFraction == false) {
            this.fsat.modifications[this.exploreModIndex].fsat.fieldData.operatingFraction = this.fsat.fieldData.operatingFraction;
            this.calculate();
        }
    }

    toggleFlowRate() {
        if (this.showFlowRate == false) {
            this.fsat.modifications[this.exploreModIndex].fsat.fieldData.flowRate = this.fsat.fieldData.flowRate;
            this.calculate();
        }
    }

    calculate() {
        this.emitCalculate.emit(true);
    }

    focusField(str: string) {
        this.helpPanelService.currentField.next(str);
        this.modifyConditionsService.modifyConditionsTab.next('fan-field-data')
    }

    checkPressure(num: number){
        this.calculate();
        let val;
        if (num == 1) {
            val = this.fsat.fieldData.outletPressure;
        } else if (num == 2) {
            val = this.fsat.modifications[this.exploreModIndex].fsat.fieldData.outletPressure;
        }
        if(val < 0){
            if (num == 1) {
                this.pressureError1 = "Cannot have negative operating fraction";
            } else if (num == 2) {
                this.pressureError2 = "Cannot have negative operating fraction";
            }
        }else{
            if (num == 1) {
                this.pressureError1 = null;
            } else if (num == 2) {
                this.pressureError2 = null;
            }
        }
    }

    checkOpFraction(num: number) {
        this.calculate();
        let val;
        if (num == 1) {
            val = this.fsat.fieldData.operatingFraction;
        } else if (num == 2) {
            val = this.fsat.modifications[this.exploreModIndex].fsat.fieldData.operatingFraction;
        }
        if (val > 1) {
            if (num == 1) {
                this.opFractionError1 = 'Operating fraction needs to be between 0 - 1';
            } else if (num == 2) {
                this.opFractionError2 = 'Operating fraction needs to be between 0 - 1';
            }
        }
        else if (val < 0) {
            if (num == 1) {
                this.opFractionError1 = "Cannot have negative operating fraction";
            } else if (num == 2) {
                this.opFractionError2 = "Cannot have negative operating fraction";
            }
        }
        else {
            if (num == 1) {
                this.opFractionError1 = null;
            } else if (num == 2) {
                this.opFractionError2 = null;
            }
        }
    }
    checkFlowRate(num: number) {
        this.calculate();

        if (num == 1) {
            if (this.fsat.fieldData.flowRate < 0) {
                this.flowRateError1 = 'Flow rate must be greater than 0';
            } else {
                this.flowRateError1 = null;
            }
        } else {
            if (this.fsat.modifications[this.exploreModIndex].fsat.fieldData.flowRate < 0) {
                this.flowRateError2 = 'Flow rate must be greater than 0';
            } else {
                this.flowRateError2 = null;
            }
        }
    }

    checkCost(num: number) {
        this.calculate();
        let val;
        if (num == 1) {
            val = this.fsat.fieldData.cost;
        } else {
            val = this.fsat.modifications[this.exploreModIndex].fsat.fieldData.cost;
        }
        if (val < 0) {
            if (num == 1) {
                this.costError1 = 'Cannot have negative cost';
            } else {
                this.costError2 = 'Cannot have negative cost';
            }
        } else if (val > 1) {
            if (num == 1) {
                this.costError1 = "Shouldn't be greater then 1";
            } else {
                this.costError2 = "Shouldn't be greater then 1";
            }
        } else if (val >= 0 && val <= 1) {
            if (num == 1) {
                this.costError1 = null;
            } else {
                this.costError2 = null
            }
        } else {
            if (num == 1) {
                this.costError1 = null;
            } else {
                this.costError2 = null
            }
        }
    }


    getUnit(unit: string) {
        let tmpUnit = this.convertUnitsService.getUnit(unit);
        let dsp = tmpUnit.unit.name.display.replace('(', '');
        dsp = dsp.replace(')', '');
        return dsp;

    }


}
