import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreByVolumeFormComponent } from './explore-by-volume-form.component';

describe('ExploreByVolumeFormComponent', () => {
  let component: ExploreByVolumeFormComponent;
  let fixture: ComponentFixture<ExploreByVolumeFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreByVolumeFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreByVolumeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
