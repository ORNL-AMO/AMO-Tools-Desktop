import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaselineSystemProfileSetupComponent } from './baseline-system-profile-setup.component';

describe('BaselineSystemProfileSetupComponent', () => {
  let component: BaselineSystemProfileSetupComponent;
  let fixture: ComponentFixture<BaselineSystemProfileSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaselineSystemProfileSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaselineSystemProfileSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
