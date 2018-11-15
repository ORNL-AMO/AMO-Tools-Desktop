import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FieldDataWarnings } from '../../../psat-warning.service';
import { FormGroup } from '@angular/forms';
@Component({
    selector: 'app-system-data-form',
    templateUrl: './system-data-form.component.html',
    styleUrls: ['./system-data-form.component.css']
})
export class SystemDataFormComponent implements OnInit {
    @Output('emitCalculate')
    emitCalculate = new EventEmitter<boolean>();
    @Output('changeField')
    changeField = new EventEmitter<string>();
    @Input()
    settings: Settings;
    @Input()
    exploreModIndex: number;
    @Input()
    isVFD: boolean;
    @Input()
    baselineWarnings: FieldDataWarnings;
    @Input()
    modificationWarnings: FieldDataWarnings;
    @Input()
    baselineForm: FormGroup;
    @Input()
    modificationForm: FormGroup;
    @Output('openHeadToolModal')
    openHeadToolModal = new EventEmitter<boolean>();

    showSystemData: boolean = false;
    showCost: boolean = false;
    showFlowRate: boolean = false;
    showOperatingHours: boolean = false;
    showHead: boolean = false;
    showName: boolean = false;

    constructor(private convertUnitsService: ConvertUnitsService) {

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
        // this.baselineForm = this.fieldDataService.getFormFromObj(this.psat.inputs, true);
        // this.baselineForm.disable();
        // this.modificationForm = this.fieldDataService.getFormFromObj(this.psat.modifications[this.exploreModIndex].psat.inputs, false);
        //this.checkWarnings();
        this.initCost();
        this.initFlowRate();
        this.initHead();
        this.initOpHours();
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

    initOpHours() {
        if (this.baselineForm.controls.operatingHours.value != this.modificationForm.controls.operatingHours.value) {
            this.showOperatingHours = true;
        } else {
            this.showOperatingHours = false;
        }
    }

    initSystemData() {
        if (this.showCost || this.showOperatingHours) {
            this.showSystemData = true;
        } else {
            this.showSystemData = false;
        }
    }

    toggleSystemData() {
        if (this.showSystemData == false) {
            this.showCost = false;
            // this.showFlowRate = false;
            // this.showHead = false;
            this.showOperatingHours = false;
            this.toggleCost();
            // this.toggleFlowRate();
            // this.toggleHead();
            this.toggleOperatingHours();
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

    toggleOperatingHours() {
        if (this.showOperatingHours == false) {
            this.modificationForm.controls.operatingHours.patchValue(this.baselineForm.controls.operatingHours.value);
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
        // this.psat.modifications[this.exploreModIndex].psat.inputs = this.fieldDataService.getPsatInputsFromForm(this.modificationForm, this.psat.modifications[this.exploreModIndex].psat.inputs);
        // this.checkWarnings();
        this.emitCalculate.emit(true);
    }

    focusField(str: string) {
        this.changeField.emit(str);
    }

    // checkWarnings() {
    //     this.baselineWarnings = this.psatWarningService.checkFieldData(this.psat, this.settings);
    //     this.modificationWarnings = this.psatWarningService.checkFieldData(this.psat.modifications[this.exploreModIndex].psat, this.settings);
    // }

    getDisplayUnit(unit: string) {
        let tmpUnit = this.convertUnitsService.getUnit(unit);
        let dsp = tmpUnit.unit.name.display.replace('(', '');
        dsp = dsp.replace(')', '');
        return dsp;
    }

    showHeadToolModal(){
        this.openHeadToolModal.emit(true);
    }

}