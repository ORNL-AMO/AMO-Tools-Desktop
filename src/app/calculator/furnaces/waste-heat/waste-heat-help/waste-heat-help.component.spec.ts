import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteHeatHelpComponent } from './waste-heat-help.component';

describe('WasteHeatHelpComponent', () => {
  let component: WasteHeatHelpComponent;
  let fixture: ComponentFixture<WasteHeatHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WasteHeatHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WasteHeatHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
