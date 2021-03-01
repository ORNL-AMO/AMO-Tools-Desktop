import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteHeatFormComponent } from './waste-heat-form.component';

describe('WasteHeatFormComponent', () => {
  let component: WasteHeatFormComponent;
  let fixture: ComponentFixture<WasteHeatFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WasteHeatFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WasteHeatFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
