import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges, HostListener } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { OperatingHours } from '../../../../shared/models/operations';
import { CompressorReplacementService, CompressorReplacementData, CompressorUnits, CompressorReplacementWarnings } from '../compressor-replacement.service';
import { Settings } from '../../../../shared/models/settings';
import { CompressorCagiService, CagiRow, CagiRequirementCriteria } from '../compressor-cagi.service';

@Component({
  selector: 'app-compressor-replacement-form',
  templateUrl: './compressor-replacement-form.component.html',
  styleUrls: ['./compressor-replacement-form.component.css'],
  standalone: false
})
export class CompressorReplacementFormComponent implements OnInit {
  @Input() data: CompressorReplacementData;
  @Input() index: number;
  @Input() isBaseline: boolean;
  @Input() selected: boolean;
  @Input() settings: Settings;
  /** Baseline rows this modification row can take its average power from. */
  @Input() linkTargets: Array<CompressorReplacementData> = [];
  @Input() linkSourceAtmosphericPressure: number;
  @Input() atmosphericPressure: number;
  @Output('emitCalculate') emitCalculate = new EventEmitter<CompressorReplacementData>();
  @Output('emitRemoveCompressor') emitRemoveCompressor = new EventEmitter<number>();
  @Output('emitFocusField') emitFocusField = new EventEmitter<string>();

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event']) onResize(event) { this.setOpHoursModalWidth(); }

  form: UntypedFormGroup;
  warnings: CompressorReplacementWarnings;
  idString: string;
  isEditingName: boolean = false;
  showOperatingHoursModal: boolean = false;
  operatingHoursTargetControl: string;
  formWidth: number;

  cagiLoaded: boolean = false;
  cagiLoadError: boolean = false;
  modelSuggestions: Array<CagiRow> = [];
  requirementSuggestions: Array<CagiRow> = [];
  showModelSuggestions: boolean = false;
  showRequirementSuggestions: boolean = false;
  showCagiDetails: boolean = false;
  showDesignDetails: boolean = false;

  controlTypeOptions: Array<{ value: number, label: string }> = [
    { value: 1, label: 'Inlet modulation without unloading' },
    { value: 2, label: 'Inlet modulation with unloading' },
    { value: 3, label: 'Variable displacement with unloading' },
    { value: 4, label: 'Load/unload' },
    { value: 5, label: 'Multi-step unloading' },
    { value: 6, label: 'Start/Stop' },
    { value: 11, label: 'VFD' }
  ];

  turndownRungOptions: Array<{ value: string, label: string }> = [
    { value: 'min', label: 'Min Capacity' },
    { value: 'c1', label: 'Capacity 1' },
    { value: 'c2', label: 'Capacity 2' },
    { value: 'c3', label: 'Capacity 3' },
    { value: 'c4', label: 'Capacity 4' },
    { value: 'max', label: 'Max Capacity' }
  ];

  private suggestionBlurTimeout: ReturnType<typeof setTimeout>;

  constructor(public compressorReplacementService: CompressorReplacementService, private compressorCagiService: CompressorCagiService) { }

  ngOnInit(): void {
    this.idString = (this.isBaseline ? 'baseline_' : 'modification_') + this.index;
    this.form = this.compressorReplacementService.getFormFromObj(this.data);
    if (this.selected === false) { this.form.disable(); }
    this.applyLinkState();
    this.checkWarnings();
    this.compressorCagiService.initCagiData().then(() => this.cagiLoaded = true).catch(() => this.cagiLoadError = true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.form) { return; }
    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected === false) { this.form.disable(); } else { this.form.enable(); }
    }
    // form.enable() clears the average-power lock, so it is re-applied on every change.
    this.applyLinkState();
  }

  /** A linked average power comes from the baseline row, so its input is locked. */
  private applyLinkState(): void {
    if (!this.form || this.selected === false) { return; }
    const control = this.form.controls.averagePower;
    // emitEvent false so this doesn't trigger another calculate()
    if (this.isAveragePowerLinked) {
      if (control.enabled) { control.disable({ emitEvent: false }); }
    } else if (control.disabled) {
      control.enable({ emitEvent: false });
    }
  }

  get isAveragePowerMode(): boolean {
    return this.form && this.form.controls.powerInputType.value === 'averagePower';
  }

  /** Offered on modification rows in average-power mode only. */
  get showAveragePowerLink(): boolean {
    return !this.isBaseline && this.isAveragePowerMode && this.linkTargets && this.linkTargets.length > 0;
  }

  get isAveragePowerLinked(): boolean {
    return this.showAveragePowerLink && !!this.form.controls.linkedCompressorId.value;
  }

  /** Baseline average power re-scaled for the operating pressure change. The typed value is kept for unlinking. */
  get linkedAveragePower(): number {
    const linkedId: string = this.form.controls.linkedCompressorId.value;
    const source: CompressorReplacementData = (this.linkTargets || [])
      .find(candidate => candidate.compressorId === linkedId);
    if (!this.compressorReplacementService.isValidLinkSource(source)) { return undefined; }
    const ratio: number = this.compressorReplacementService.operatingPressureRatio(
      source.operatingPressure, this.linkSourceAtmosphericPressure,
      this.form.controls.operatingPressure.value, this.atmosphericPressure, this.settings);
    return (source.averagePower || 0) * ratio;
  }

  /** A target is selected but is missing its power or pressure. */
  get isLinkTargetIncomplete(): boolean {
    return this.isAveragePowerLinked && this.linkedAveragePower === undefined;
  }

  setLinkedCompressor(): void {
    this.applyLinkState();
    this.calculate();
  }

  ngAfterViewInit(): void { setTimeout(() => this.setOpHoursModalWidth(), 100); }

  get manufacturers(): Array<string> { return this.compressorCagiService.manufacturers; }

  get units(): CompressorUnits { return this.compressorReplacementService.getUnits(this.settings); }

  calculate(): void {
    this.checkWarnings();
    this.emitCalculate.emit(this.compressorReplacementService.getObjFromForm(this.form));
  }

  checkWarnings(): void {
    this.warnings = this.compressorReplacementService.checkWarnings(this.compressorReplacementService.getObjFromForm(this.form));
  }

  focusField(str: string): void { this.emitFocusField.emit(str); }
  removeCompressor(): void { this.emitRemoveCompressor.emit(this.index); }
  editCompressorName(): void { this.isEditingName = true; }
  doneEditingName(): void { this.isEditingName = false; }
  setPowerInputType(): void { this.applyLinkState(); this.calculate(); }

  setLookupType(): void {
    this.showModelSuggestions = false;
    this.showRequirementSuggestions = false;
    this.calculate();
  }

  onModelSearch(event: Event): void {
    const value: string = (event.target as HTMLInputElement).value;
    this.form.controls.searchModelTerm.patchValue(value);
    this.modelSuggestions = this.compressorCagiService.searchByModel(value);
    this.showModelSuggestions = true;
    this.calculate();
  }

  onRequirementChange(): void {
    this.requirementSuggestions = this.compressorCagiService.searchByRequirements(this.getCriteria());
    this.showRequirementSuggestions = true;
    this.calculate();
  }

  /** The CAGI sheet is in acfm / psig, so metric criteria are converted before searching. */
  private getCriteria(): CagiRequirementCriteria {
    const svc = this.compressorReplacementService;
    return {
      capacity: svc.toCagiAirflow(this.form.controls.capacityRequirement.value, this.settings),
      capacityRange: svc.toCagiAirflow(this.form.controls.capacityRange.value, this.settings),
      pressure: svc.toCagiPressure(this.form.controls.pressureRequirement.value, this.settings),
      pressureRange: svc.toCagiPressure(this.form.controls.pressureRange.value, this.settings),
      vsdOnly: this.form.controls.vsdOnly.value,
      includeWaterCooled: this.form.controls.includeWaterCooled.value,
      oilFree: this.form.controls.oilFree.value,
      brand: this.form.controls.brand.value
    };
  }

  selectRow(row: CagiRow): void {
    const extracted = this.compressorCagiService.extractData(row);
    const svc = this.compressorReplacementService;
    const air = (v: number) => svc.convertCagiAirflow(v, this.settings);
    const psi = (v: number) => svc.convertCagiPressure(v, this.settings);
    this.form.patchValue({
      ratedCapacity: air(extracted.ratedCapacity),
      fullLoadPower: extracted.fullLoadPower,
      zeroFlowPower: extracted.zeroFlowPower,
      averagePower: undefined,
      powerInputType: 'flAndZeroFlow',
      selectedManufacturer: extracted.manufacturer,
      selectedModelNumber: extracted.modelNumber,
      fullLoadPressure: psi(extracted.fullLoadPressure),
      maxFullFlowPressure: psi(extracted.maxFullFlowPressure),
      operatingPressure: psi(extracted.fullLoadPressure),
      cagiType: extracted.cagiType,
      numberOfStages: extracted.numberOfStages,
      compressorOilFree: extracted.compressorOilFree,
      maxCapacity: air(extracted.maxCapacity),
      capacity4: air(extracted.capacity4),
      capacity3: air(extracted.capacity3),
      capacity2: air(extracted.capacity2),
      capacity1: air(extracted.capacity1),
      minCapacity: air(extracted.minCapacity),
      powerAtMaxCapacity: extracted.powerAtMaxCapacity,
      powerAtCapacity4: extracted.powerAtCapacity4,
      powerAtCapacity3: extracted.powerAtCapacity3,
      powerAtCapacity2: extracted.powerAtCapacity2,
      powerAtCapacity1: extracted.powerAtCapacity1,
      powerAtMinCapacity: extracted.powerAtMinCapacity,
      turndownCapacity: air(extracted.minCapacity),
      turndownPower: extracted.powerAtMinCapacity,
      midTurndownCapacity: air(extracted.capacity3),
      midTurndownPower: extracted.powerAtCapacity3,
      // back to Auto so a copied control type doesn't carry over to the new unit
      controlType: null
    });
    this.showModelSuggestions = false;
    this.showRequirementSuggestions = false;
    this.showCagiDetails = true;
    this.calculate();
  }

  suggestionLabel(row: CagiRow): string { return this.compressorCagiService.suggestionLabel(row); }

  cancelHideSuggestions(): void { clearTimeout(this.suggestionBlurTimeout); }
  hideSuggestionsSoon(): void {
    this.suggestionBlurTimeout = setTimeout(() => { this.showModelSuggestions = false; this.showRequirementSuggestions = false; }, 150);
  }
  toggleCagiDetails(): void { this.showCagiDetails = !this.showCagiDetails; }
  toggleDesignDetails(): void { this.showDesignDetails = !this.showDesignDetails; }

  /** MEASUR compressorType: 1/2 injected screw, 3 oil-free screw, 4/5 recip, 6 centrifugal. */
  get compressorTypeValue(): number {
    const type: string = (this.form.controls.cagiType.value || '').toLowerCase();
    const stages: number = (this.form.controls.numberOfStages.value >= 2) ? 2 : 1;
    if (type.indexOf('centrif') >= 0) { return 6; }
    if (type.indexOf('recip') >= 0) { return stages === 2 ? 5 : 4; }
    if (this.form.controls.compressorOilFree.value) { return 3; }
    return stages === 2 ? 2 : 1;
  }

  /** Effective control type: explicit selection, else VFD when a ladder exists, else load/unload. */
  get controlTypeValue(): number {
    const selected = this.form.controls.controlType.value;
    if (selected !== undefined && selected !== null && selected !== '') { return Number(selected); }
    return this.hasLadder ? 11 : 4;
  }

  get hasLadder(): boolean {
    const c = this.form.controls;
    const pairs: Array<Array<unknown>> = [
      [c.maxCapacity.value, c.powerAtMaxCapacity.value],
      [c.capacity4.value, c.powerAtCapacity4.value],
      [c.capacity3.value, c.powerAtCapacity3.value],
      [c.capacity2.value, c.powerAtCapacity2.value],
      [c.capacity1.value, c.powerAtCapacity1.value],
      [c.minCapacity.value, c.powerAtMinCapacity.value]
    ];
    let count: number = 0;
    pairs.forEach(pair => { if (this.isNum(pair[0]) && this.isNum(pair[1])) { count++; } });
    return count >= 2;
  }

  get showBlowdownTime(): boolean {
    const t: number = this.compressorTypeValue;
    const c: number = this.controlTypeValue;
    return (t === 1 || t === 2) && c >= 1 && c <= 5;
  }
  get showUnloadSumpPressure(): boolean {
    const t: number = this.compressorTypeValue;
    return (t === 1 || t === 2) && this.controlTypeValue !== 6;
  }
  get showUnloadPointCapacity(): boolean {
    const c: number = this.controlTypeValue;
    return c === 2 || c === 3 || c === 4 || c === 5 || c === 11;
  }
  /** Load/unload always unloads at 100%; the other unloading controls can be edited. */
  get unloadPointCapacityLocked(): boolean { return this.controlTypeValue === 4; }
  get showTurndownSelection(): boolean { return this.controlTypeValue === 11; }
  get showModulatingFields(): boolean {
    const c: number = this.controlTypeValue;
    return c === 1 || c === 2 || c === 3;
  }
  get isCentrifugalDeferred(): boolean { return this.compressorTypeValue === 6; }
  get computedNoLoadPowerFM(): number {
    const fl: number = Number(this.form.controls.fullLoadPower.value);
    const zf: number = Number(this.form.controls.zeroFlowPower.value);
    if (!fl || isNaN(fl) || fl === 0 || isNaN(zf)) { return 0; }
    return (zf / fl) * 100;
  }

  onTurndownRungChange(): void {
    const rungVal = this.rungValues(this.form.controls.turndownRung.value);
    if (rungVal) { this.form.patchValue({ turndownCapacity: rungVal.capacity, turndownPower: rungVal.power }); }
    this.calculate();
  }

  onMidTurndownRungChange(): void {
    const rungVal = this.rungValues(this.form.controls.midTurndownRung.value);
    if (rungVal) { this.form.patchValue({ midTurndownCapacity: rungVal.capacity, midTurndownPower: rungVal.power }); }
    this.calculate();
  }

  private rungValues(rung: string): { capacity: number, power: number } {
    const c = this.form.controls;
    const map: { [key: string]: Array<unknown> } = {
      max: [c.maxCapacity.value, c.powerAtMaxCapacity.value],
      c4: [c.capacity4.value, c.powerAtCapacity4.value],
      c3: [c.capacity3.value, c.powerAtCapacity3.value],
      c2: [c.capacity2.value, c.powerAtCapacity2.value],
      c1: [c.capacity1.value, c.powerAtCapacity1.value],
      min: [c.minCapacity.value, c.powerAtMinCapacity.value]
    };
    const pair = map[rung];
    if (pair && this.isNum(pair[0]) && this.isNum(pair[1])) { return { capacity: Number(pair[0]), power: Number(pair[1]) }; }
    return null;
  }

  setControlType(): void {
    if (this.unloadPointCapacityLocked) {
      this.form.controls.unloadPointCapacity.patchValue(100);
    }
    this.calculate();
  }

  private isNum(v: unknown): boolean {
    if (v === null || v === undefined || v === '') { return false; }
    return Number.isFinite(typeof v === 'number' ? v : parseFloat(String(v)));
  }

  openOperatingHoursModal(targetControl: string): void {
    this.operatingHoursTargetControl = targetControl;
    this.showOperatingHoursModal = true;
  }
  closeOperatingHoursModal(): void { this.showOperatingHoursModal = false; }
  updateOperatingHours(operatingHours: OperatingHours): void {
    this.compressorReplacementService.operatingHours = operatingHours;
    if (this.operatingHoursTargetControl) {
      this.form.controls[this.operatingHoursTargetControl].patchValue(operatingHours.hoursPerYear);
    }
    this.calculate();
    this.closeOperatingHoursModal();
  }
  setOpHoursModalWidth(): void {
    if (this.formElement && this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
