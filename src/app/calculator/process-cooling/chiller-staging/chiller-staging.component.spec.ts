import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChillerStagingComponent } from './chiller-staging.component';

describe('ChillerStagingComponent', () => {
  let component: ChillerStagingComponent;
  let fixture: ComponentFixture<ChillerStagingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChillerStagingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChillerStagingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
