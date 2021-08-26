import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintSettingsComponent } from './print-settings.component';

describe('PrintSettingsComponent', () => {
  let component: PrintSettingsComponent;
  let fixture: ComponentFixture<PrintSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
