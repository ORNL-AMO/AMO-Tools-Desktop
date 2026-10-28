import { Output, ViewChild, HostListener, Component, Input, EventEmitter, ElementRef } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { OperatingHours } from "../../../../shared/models/operations";
import { WaterAssessmentService } from "../../../water-assessment.service";
import { MotorEnergyService } from "./motor-energy.service";
import { Settings } from "../../../../shared/models/settings";
import { MotorEnergy } from "process-flow-lib";

@Component({
  selector: 'app-motor-energy',
  standalone: false,
  templateUrl: './motor-energy.component.html',
  styleUrl: './motor-energy.component.css'
})
export class MotorEnergyComponent {
  @Input()
  motorEnergy: MotorEnergy;
  @Output()
  updateMotorEnergy: EventEmitter<MotorEnergy> = new EventEmitter<MotorEnergy>();
  settings: Settings;
  form: FormGroup;
  formWidth: number;
  showOperatingHoursModal: boolean = false;
  showLoadFactorModal: boolean = false;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  constructor(private waterAssessmentService: WaterAssessmentService,
    private motorEnergyService: MotorEnergyService) {}

  ngOnInit() {
    this.settings = this.waterAssessmentService.settings.getValue();
    this.initForm();
  }

  ngOnDestroy() {}

  initForm() {
   this.form = this.motorEnergyService.getMotorEnergyForm(this.motorEnergy);
  }

  save() {
    let updatedMotorEnergy: MotorEnergy = this.motorEnergyService.getMotorEnergyFromForm(this.form);
    this.updateMotorEnergy.emit(updatedMotorEnergy);
  }

  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }
  
  setOpHoursModalWidth() {
    if (this.formElement && this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
    this.waterAssessmentService.modalOpen.next(false);
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
    this.waterAssessmentService.modalOpen.next(true);
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.motorEnergyService.operatingHours = oppHours;
    this.form.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.save();
    this.closeOperatingHoursModal();
  }

  calculateSystemEfficiency() {

  }

  openLoadFactorModal() {
    this.waterAssessmentService.modalOpen.next(true);
    this.showLoadFactorModal = true;
  }

  hideLoadFactorModal() {
    this.showLoadFactorModal = false;
    this.waterAssessmentService.modalOpen.next(false);
  }

  applyModalData(percentLoad: number) {
    this.form.controls.loadFactor.patchValue(percentLoad);
    this.save();
    this.hideLoadFactorModal();
  }



}

