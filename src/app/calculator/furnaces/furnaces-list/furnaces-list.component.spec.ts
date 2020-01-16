import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FurnacesListComponent } from './furnaces-list.component';

describe('FurnacesListComponent', () => {
  let component: FurnacesListComponent;
  let fixture: ComponentFixture<FurnacesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FurnacesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FurnacesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
