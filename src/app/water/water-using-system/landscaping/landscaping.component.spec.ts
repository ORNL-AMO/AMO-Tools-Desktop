import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandscapingComponent } from './landscaping.component';

describe('LandscapingComponent', () => {
  let component: LandscapingComponent;
  let fixture: ComponentFixture<LandscapingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandscapingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LandscapingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
