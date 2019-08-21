import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild, HostListener, ElementRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FieldDataWarnings } from '../../../psat-warning.service';
import { FormGroup } from '@angular/forms';
import { OperatingHours } from '../../../../shared/models/operations';
import { PSAT } from '../../../../shared/models/psat';
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
    @Input()
    modificationPsat: PSAT;

    showSystemData: boolean = false;
    showFlowRate: boolean = false;
    showHead: boolean = false;

    @ViewChild('formElement') formElement: ElementRef;
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.setOpHoursModalWidth();
    }

    formWidth: number;
    showOperatingHoursModal: boolean = false;
    constructor() { }

    ngOnInit() {
        this.init();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.exploreModIndex) {
            if (!changes.exploreModIndex.isFirstChange()) {
                this.init()
            }
        }
        if (changes.isVFD) {
            if (!changes.isVFD.isFirstChange()) {
                this.init();
            }
        }
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.setOpHoursModalWidth();
        }, 100)
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

    showHeadToolModal() {
        this.openHeadToolModal.emit(true);
    }

    closeOperatingHoursModal() {
        this.showOperatingHoursModal = false;
    }

    openOperatingHoursModal() {
        this.showOperatingHoursModal = true;
    }

    updateOperatingHours(oppHours: OperatingHours) {
        this.modificationPsat.operatingHours = oppHours;
        this.modificationForm.controls.operatingHours.patchValue(oppHours.hoursPerYear);
        this.calculate();
        this.closeOperatingHoursModal();
    }

    setOpHoursModalWidth() {
        if (this.formElement.nativeElement.clientWidth) {
            this.formWidth = this.formElement.nativeElement.clientWidth;
        }
    }

}