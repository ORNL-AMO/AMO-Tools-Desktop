import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterUsingSystemComponent } from './water-using-system.component';

describe('WaterUsingSystemComponent', () => {
  let component: WaterUsingSystemComponent;
  let fixture: ComponentFixture<WaterUsingSystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterUsingSystemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WaterUsingSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
