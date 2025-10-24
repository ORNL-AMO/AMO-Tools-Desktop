import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemSetupComponent } from './system-setup.component';

describe('SystemSetupComponent', () => {
  let component: SystemSetupComponent;
  let fixture: ComponentFixture<SystemSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
