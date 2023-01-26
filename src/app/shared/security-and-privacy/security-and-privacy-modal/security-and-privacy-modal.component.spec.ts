import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityAndPrivacyModalComponent } from './security-and-privacy-modal.component';

describe('SecurityAndPrivacyModalComponent', () => {
  let component: SecurityAndPrivacyModalComponent;
  let fixture: ComponentFixture<SecurityAndPrivacyModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SecurityAndPrivacyModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityAndPrivacyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
