import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterHeatingFormComponent } from './water-heating-form.component';

describe('WaterHeatingFormComponent', () => {
  let component: WaterHeatingFormComponent;
  let fixture: ComponentFixture<WaterHeatingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WaterHeatingFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterHeatingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
