import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpNameplateDataHelpComponent } from './pump-nameplate-data-help.component';

describe('PumpNameplateDataHelpComponent', () => {
  let component: PumpNameplateDataHelpComponent;
  let fixture: ComponentFixture<PumpNameplateDataHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpNameplateDataHelpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PumpNameplateDataHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
