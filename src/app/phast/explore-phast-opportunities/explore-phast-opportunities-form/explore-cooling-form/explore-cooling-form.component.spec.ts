import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreCoolingFormComponent } from './explore-cooling-form.component';

describe('ExploreCoolingFormComponent', () => {
  let component: ExploreCoolingFormComponent;
  let fixture: ComponentFixture<ExploreCoolingFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreCoolingFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreCoolingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
