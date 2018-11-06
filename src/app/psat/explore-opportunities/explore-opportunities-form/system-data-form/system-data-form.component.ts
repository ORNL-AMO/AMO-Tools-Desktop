import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { PSAT } from '../../../../shared/models/psat';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { PsatWarningService, FieldDataWarnings } from '../../../psat-warning.service';
import { FormGroup } from '@angular/forms';
import { FieldDataService } from '../../../field-data/field-data.service';
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

    baselineForm: FormGroup;
    modificationForm: FormGroup;
    baselineWarnings: FieldDataWarnings;
    modificationWarnings: FieldDataWarnings;
    constructor(private convertUnitsService: ConvertUnitsService, private psatWarningService: PsatWarningService, private fieldDataService: FieldDataService) {

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
        this.baselineForm = this.fieldDataService.getFormFromObj(this.psat.inputs, true);
        this.baselineForm.disable();
        this.modificationForm = this.fieldDataService.getFormFromObj(this.psat.modifications[this.exploreModIndex].psat.inputs, false);
        this.checkWarnings();
        this.initCost();
        this.initFlowRate();
        this.initHead();
        this.initOpFraction();
        this.initSystemData();
    }

    initCost() {
        if (this.baselineForm.controls.costKwHr.value != this.modificationForm.controls.costKwHr.value) {
            this.showCost = true;
        } else {
            this.showCost = false;
        }
    }

    initFlowRate() {
        if (this.baselineForm.controls.flowRate.value != this.modificationForm.controls.flowRate.value) {
            this.showFlowRate = true;
        } else {
            this.showFlowRate = false;
        }
    }

    initHead() {
        if (this.baselineForm.controls.head.value != this.modificationForm.controls.head.value) {
            this.showHead = true;
        } else {
            this.showHead = false;
        }
    }

    initOpFraction() {
        if (this.baselineForm.controls.operatingFraction.value != this.modificationForm.controls.operatingFraction.value) {
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
            this.modificationForm.controls.costKwHr.patchValue(this.baselineForm.controls.costKwHr.value);
            this.calculate();
        }
    }

    toggleHead() {
        if (this.showHead == false) {
            this.modificationForm.controls.head.patchValue(this.baselineForm.controls.head.value);
            this.calculate();
        }
    }

    toggleOperatingFraction() {
        if (this.showOperatingFraction == false) {
            this.modificationForm.controls.operatingFraction.patchValue(this.baselineForm.controls.operatingFraction.value);
            this.calculate();
        }
    }

    toggleFlowRate() {
        if (this.showFlowRate == false) {
            this.modificationForm.controls.flowRate.patchValue(this.baselineForm.controls.flowRate.value);
            this.calculate();
        }
    }

    calculate() {
        //not needed unless we enable baseline editing
        //this.psat.inputs = this.fieldDataService.getPsatInputsFromForm(this.baselineForm, this.psat.inputs);
        this.psat.modifications[this.exploreModIndex].psat.inputs = this.fieldDataService.getPsatInputsFromForm(this.modificationForm, this.psat.modifications[this.exploreModIndex].psat.inputs);
        this.checkWarnings();
        this.emitCalculate.emit(true);
    }

    focusField(str: string) {
        this.changeField.emit(str);
    }

    checkWarnings() {
        this.baselineWarnings = this.psatWarningService.checkFieldData(this.psat, this.settings);
        this.modificationWarnings = this.psatWarningService.checkFieldData(this.psat.modifications[this.exploreModIndex].psat, this.settings);
    }

    getDisplayUnit(unit: string) {
        let tmpUnit = this.convertUnitsService.getUnit(unit);
        let dsp = tmpUnit.unit.name.display.replace('(', '');
        dsp = dsp.replace(')', '');
        return dsp;
    }

}