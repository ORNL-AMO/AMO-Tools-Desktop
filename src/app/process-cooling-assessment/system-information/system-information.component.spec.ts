import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemInformationComponent } from './system-information.component';

describe('SystemInformationComponent', () => {
  let component: SystemInformationComponent;
  let fixture: ComponentFixture<SystemInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
