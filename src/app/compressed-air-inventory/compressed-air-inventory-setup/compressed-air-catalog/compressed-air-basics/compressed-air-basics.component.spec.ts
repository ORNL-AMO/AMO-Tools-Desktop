import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirBasicsComponent } from './compressed-air-basics.component';

describe('CompressedAirBasicsComponent', () => {
  let component: CompressedAirBasicsComponent;
  let fixture: ComponentFixture<CompressedAirBasicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirBasicsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressedAirBasicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
