import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreFlueGasFormComponent } from './explore-flue-gas-form.component';

describe('ExploreFlueGasFormComponent', () => {
  let component: ExploreFlueGasFormComponent;
  let fixture: ComponentFixture<ExploreFlueGasFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreFlueGasFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreFlueGasFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
