import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteHeatComponent } from './waste-heat.component';

describe('WasteHeatComponent', () => {
  let component: WasteHeatComponent;
  let fixture: ComponentFixture<WasteHeatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WasteHeatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WasteHeatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
