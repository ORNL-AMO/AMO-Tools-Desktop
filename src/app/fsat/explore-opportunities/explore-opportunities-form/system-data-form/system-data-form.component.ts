import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FSAT } from '../../../../shared/models/fans';
import { HelpPanelService } from '../../../help-panel/help-panel.service';
import { ModifyConditionsService } from '../../../modify-conditions/modify-conditions.service';
import { FanFieldDataWarnings, FanOperationsWarnings } from '../../../fsat-warning.service';
import { UntypedFormGroup } from '@angular/forms';
import { OperatingHours } from '../../../../shared/models/operations';

@Component({
    selector: 'app-system-data-form',
    templateUrl: './system-data-form.component.html',
    styleUrls: ['./system-data-form.component.css'],
    standalone: false
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
    @Input()
    baselineOperationsForm: UntypedFormGroup;
    @Input()
    modificationOperationsForm: UntypedFormGroup;
    @Input()
    baselineForm: UntypedFormGroup;
    @Input()
    modificationForm: UntypedFormGroup;
    @Input()
    modificationWarnings: FanFieldDataWarnings;
    @Input()
    baselineWarnings: FanFieldDataWarnings;
    @Input()
    modificationOperationsWarnings: FanOperationsWarnings;
    @Input()
    baselineOperationsWarnings: FanOperationsWarnings;
    @Output('showPressureModal')
    showPressureModal = new EventEmitter<string>();
    @Input()
    isVFD: boolean;

    @ViewChild('formElement', { static: false }) formElement: ElementRef;
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.setOpHoursModalWidth();
    }

    formWidth: number;
    showOperatingHoursModal: boolean = false;

    showCost: boolean = false;
    showOperatingHours: boolean = false;

    constructor(
        private helpPanelService: HelpPanelService,
        private modifyConditionsService: ModifyConditionsService) {
    }

    ngOnInit() {
        this.init();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.exploreModIndex) {
            if (!changes.exploreModIndex.isFirstChange()) {
                this.init();
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
        this.initCost();
        this.initFlowRate();
        this.initPressure();
        this.initOperatingHours();
        this.initSystemData();
    }

    initCost() {
        if (this.baselineOperationsForm.controls.cost.value !== this.modificationOperationsForm.controls.cost.value) {
            this.showCost = true;
        } else {
            this.showCost = false;
        }
    }

    initFlowRate() {
        if (this.baselineForm.controls.flowRate.value !== this.modificationForm.controls.flowRate.value) {
            this.fsat.modifications[this.exploreModIndex].exploreOppsShowFlowRate = { hasOpportunity: true, display: 'Reduce System Flow Rate' };
        } else {
            this.fsat.modifications[this.exploreModIndex].exploreOppsShowFlowRate = { hasOpportunity: false, display: 'Reduce System Flow Rate' };
        }
    }

    initPressure() {
        if (this.baselineForm.controls.inletPressure.value !== this.modificationForm.controls.inletPressure.value ||
            this.baselineForm.controls.outletPressure.value !== this.modificationForm.controls.outletPressure.value) {
            this.fsat.modifications[this.exploreModIndex].exploreOppsShowReducePressure = { hasOpportunity: true, display: 'Reduce System Pressure' };
        } else {
            this.fsat.modifications[this.exploreModIndex].exploreOppsShowReducePressure = { hasOpportunity: false, display: 'Reduce System Pressure' };
        }
    }

    initOperatingHours() {
        if (this.baselineOperationsForm.controls.operatingHours.value !== this.modificationOperationsForm.controls.operatingHours.value) {
            this.showOperatingHours = true;
        } else {
            this.showOperatingHours = false;
        }
    }

    initSystemData() {
        if (this.showCost || this.showOperatingHours) {
            this.fsat.modifications[this.exploreModIndex].exploreOppsShowOpData = { hasOpportunity: true, display: 'Adjust Operational Data' };
        } else {
            this.fsat.modifications[this.exploreModIndex].exploreOppsShowOpData = { hasOpportunity: false, display: 'Adjust Operational Data' };
        }
    }

    toggleSystemData() {
        if (this.fsat.modifications[this.exploreModIndex].exploreOppsShowOpData.hasOpportunity === false) {
            this.showCost = false;
            this.showOperatingHours = false;
            this.toggleCost();
            this.toggleOperatingHours();
        }
    }

    toggleCost() {
        if (this.showCost === false) {
            this.modificationOperationsForm.controls.cost.patchValue(this.baselineOperationsForm.controls.cost.value);
            this.calculate();
        }
    }

    togglePressure() {
        if (this.fsat.modifications[this.exploreModIndex].exploreOppsShowReducePressure.hasOpportunity === false) {
            this.modificationForm.controls.inletPressure.patchValue(this.baselineForm.controls.inletPressure.value);
            this.modificationForm.controls.outletPressure.patchValue(this.baselineForm.controls.outletPressure.value);
            this.calculate();
        }
    }

    toggleOperatingHours() {
        if (this.showOperatingHours === false) {
            this.modificationOperationsForm.controls.operatingHours.patchValue(this.baselineOperationsForm.controls.operatingHours.value);
            this.calculate();
        }
    }

    toggleFlowRate() {
        if (this.fsat.modifications[this.exploreModIndex].exploreOppsShowFlowRate.hasOpportunity === false) {
            this.modificationForm.controls.flowRate.patchValue(this.baselineForm.controls.flowRate.value);
            this.calculate();
        }
    }

    calculate() {
        this.emitCalculate.emit(true);
    }

    focusField(str: string) {
        this.helpPanelService.currentField.next(str);
        this.modifyConditionsService.modifyConditionsTab.next('fan-field-data');
    }
    
    showInletPressureModal() {
        this.showPressureModal.emit('inlet');
    }

    showOutletPressureModal() {
        this.showPressureModal.emit('outlet');
    }

    closeOperatingHoursModal() {
        this.showOperatingHoursModal = false;
    }

    openOperatingHoursModal() {
        this.showOperatingHoursModal = true;
    }

    updateOperatingHours(oppHours: OperatingHours) {
        this.fsat.modifications[this.exploreModIndex].fsat.operatingHours = oppHours;
        this.modificationOperationsForm.controls.operatingHours.patchValue(oppHours.hoursPerYear);
        this.calculate();
        this.closeOperatingHoursModal();
    }

    setOpHoursModalWidth() {
        if (this.formElement.nativeElement.clientWidth) {
            this.formWidth = this.formElement.nativeElement.clientWidth;
        }
    }
}
