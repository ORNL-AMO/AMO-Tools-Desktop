import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemInformationFormComponent } from './system-information-form.component';

describe('SystemInformationFormComponent', () => {
  let component: SystemInformationFormComponent;
  let fixture: ComponentFixture<SystemInformationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemInformationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemInformationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
