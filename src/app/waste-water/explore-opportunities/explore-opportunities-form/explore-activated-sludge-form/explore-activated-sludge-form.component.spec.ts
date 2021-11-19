import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreActivatedSludgeFormComponent } from './explore-activated-sludge-form.component';

describe('ExploreActivatedSludgeFormComponent', () => {
  let component: ExploreActivatedSludgeFormComponent;
  let fixture: ComponentFixture<ExploreActivatedSludgeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExploreActivatedSludgeFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreActivatedSludgeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
