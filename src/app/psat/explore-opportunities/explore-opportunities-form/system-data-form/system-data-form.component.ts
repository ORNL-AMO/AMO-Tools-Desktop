import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild, HostListener, ElementRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FieldDataWarnings } from '../../../psat-warning.service';
import { FormGroup } from '@angular/forms';
import { OperatingHours } from '../../../../shared/models/operations';
import { PSAT, Modification } from '../../../../shared/models/psat';
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
    @Input()
    currentModification: Modification;

    @ViewChild('formElement', { static: false }) formElement: ElementRef;
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
        this.calculate();
    }

    initFlowRate() {
        if (this.baselineForm.controls.flowRate.value != this.modificationForm.controls.flowRate.value) {
            this.currentModification.exploreOppsShowFlowRate = { hasOpportunity: true, display: 'Reduce System Flow Rate' }; 

        } else {
            this.currentModification.exploreOppsShowFlowRate = { hasOpportunity: false, display: 'Reduce System Flow Rate' }; 
        }
    }

    initHead() {
        if (this.baselineForm.controls.head.value != this.modificationForm.controls.head.value) {
            this.currentModification.exploreOppsShowHead = { hasOpportunity: true, display: 'Reduce System Head Requirement' }; 
        } else {
            this.currentModification.exploreOppsShowHead = { hasOpportunity: false, display: 'Reduce System Head Requirement' }; 
        }
    }

    initSystemData() {
        if (this.baselineForm.controls.costKwHr.value != this.modificationForm.controls.costKwHr.value
            || this.baselineForm.controls.operatingHours.value != this.modificationForm.controls.operatingHours.value) {
            this.currentModification.exploreOppsShowSystemData = { hasOpportunity: true, display: 'Adjust Operational Data' }; 
        } else {
            this.currentModification.exploreOppsShowSystemData = { hasOpportunity: false, display: 'Adjust Operational Data' }; 
        }
    }

    toggleSystemData() {
        if (this.currentModification.exploreOppsShowSystemData.hasOpportunity == false) {
            this.modificationForm.controls.operatingHours.patchValue(this.baselineForm.controls.operatingHours.value);
            this.modificationForm.controls.costKwHr.patchValue(this.baselineForm.controls.costKwHr.value);
            this.calculate();
        }
    }

    toggleHead() {
        if (this.currentModification.exploreOppsShowHead.hasOpportunity == false) {
            this.modificationForm.controls.head.patchValue(this.baselineForm.controls.head.value);
            this.calculate();
        }
    }

    toggleFlowRate() {
        if (this.currentModification.exploreOppsShowFlowRate.hasOpportunity == false) {
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