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
    showFlowRate: boolean = false;
    showHead: boolean = false;

    constructor(private convertUnitsService: ConvertUnitsService) { }

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
        this.initFlowRate();
        this.initHead();
        this.initSystemData();
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

    initSystemData() {
        if (this.baselineForm.controls.costKwHr.value != this.modificationForm.controls.costKwHr.value
            || this.baselineForm.controls.operatingHours.value != this.modificationForm.controls.operatingHours.value) {
            this.showSystemData = true;
        } else {
            this.showSystemData = false;
        }
    }

    toggleSystemData() {
        if (this.showSystemData == false) {
            this.modificationForm.controls.operatingHours.patchValue(this.baselineForm.controls.operatingHours.value);
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

    toggleFlowRate() {
        if (this.showFlowRate == false) {
            this.modificationForm.controls.flowRate.patchValue(this.baselineForm.controls.flowRate.value);
            this.calculate();
        }
    }

    calculate() {
        this.emitCalculate.emit(true);
    }

    focusField(str: string) {
        this.changeField.emit(str);
    }

    getDisplayUnit(unit: string) {
        let tmpUnit = this.convertUnitsService.getUnit(unit);
        let dsp = tmpUnit.unit.name.display.replace('(', '');
        dsp = dsp.replace(')', '');
        return dsp;
    }

    showHeadToolModal() {
        this.openHeadToolModal.emit(true);
    }

}