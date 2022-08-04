import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PowerSankeyComponent } from './power-sankey.component';

describe('PowerSankeyComponent', () => {
  let component: PowerSankeyComponent;
  let fixture: ComponentFixture<PowerSankeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PowerSankeyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PowerSankeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
