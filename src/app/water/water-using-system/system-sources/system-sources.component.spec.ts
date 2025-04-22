import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemSourcesComponent } from './system-sources.component';

describe('SystemSourcesComponent', () => {
  let component: SystemSourcesComponent;
  let fixture: ComponentFixture<SystemSourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemSourcesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemSourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
