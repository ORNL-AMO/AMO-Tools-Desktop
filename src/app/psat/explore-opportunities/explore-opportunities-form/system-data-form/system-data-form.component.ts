import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { PSAT } from '../../../../shared/models/psat';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { PsatWarningService, FieldDataWarnings } from '../../../psat-warning.service';
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
    showHead: boolean = false;
    showName: boolean = false;

    costError1: string = null;
    costError2: string = null;
    flowRateError1: string = null;
    flowRateError2: string = null;
    opFractionError1: string = null;
    opFractionError2: string = null;

    tmpBaselineName: string = 'Baseline';
    constructor(private convertUnitsService: ConvertUnitsService, private psatWarningService: PsatWarningService) {

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
        this.initHead();
        this.initOpFraction();
        this.initSystemData();
    }

    initCost() {
        if (this.psat.inputs.cost_kw_hour != this.psat.modifications[this.exploreModIndex].psat.inputs.cost_kw_hour) {
            this.showCost = true;
        } else {
            this.showCost = false;
        }
    }

    initFlowRate() {
        if (this.psat.inputs.flow_rate != this.psat.modifications[this.exploreModIndex].psat.inputs.flow_rate) {
            this.showFlowRate = true;
        } else {
            this.showFlowRate = false;
        }
    }

    initHead() {
        if (this.psat.inputs.head != this.psat.modifications[this.exploreModIndex].psat.inputs.head) {
            this.showHead = true;
        } else {
            this.showHead = false;
        }
    }

    initOpFraction() {
        if (this.psat.inputs.operating_fraction != this.psat.modifications[this.exploreModIndex].psat.inputs.operating_fraction) {
            this.showOperatingFraction = true;
        } else {
            this.showOperatingFraction = false;
        }
    }

    initSystemData() {
        if (this.showCost || this.showFlowRate || this.showHead || this.showOperatingFraction) {
            this.showSystemData = true;
        } else {
            this.showSystemData = false;
        }
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
        this.checkWarnings();
        this.emitCalculate.emit(true);
    }

    focusField(str: string) {
        this.changeField.emit(str);
    }

    checkWarnings() {
        let baselineWarnings: FieldDataWarnings = this.psatWarningService.checkFieldData(this.psat, this.settings);
        this.opFractionError1 = baselineWarnings.opFractionError;
        this.flowRateError1 = baselineWarnings.flowError;
        this.costError1 = baselineWarnings.costError;
        let modificationWarnings: FieldDataWarnings = this.psatWarningService.checkFieldData(this.psat.modifications[this.exploreModIndex].psat, this.settings);
        this.opFractionError2 = modificationWarnings.opFractionError;
        this.flowRateError2 = modificationWarnings.flowError;
        this.costError2 = modificationWarnings.costError;
    }

    getUnit(unit: string) {
        let tmpUnit = this.convertUnitsService.getUnit(unit);
        let dsp = tmpUnit.unit.name.display.replace('(', '');
        dsp = dsp.replace(')', '');
        return dsp;

    }

}