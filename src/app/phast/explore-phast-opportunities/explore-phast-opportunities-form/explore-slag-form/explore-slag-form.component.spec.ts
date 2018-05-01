import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreSlagFormComponent } from './explore-slag-form.component';

describe('ExploreSlagFormComponent', () => {
  let component: ExploreSlagFormComponent;
  let fixture: ComponentFixture<ExploreSlagFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreSlagFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreSlagFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
