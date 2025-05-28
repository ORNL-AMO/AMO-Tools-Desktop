import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDiagramModalComponent } from './create-diagram-modal.component';

describe('CreateDiagramModalComponent', () => {
  let component: CreateDiagramModalComponent;
  let fixture: ComponentFixture<CreateDiagramModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDiagramModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateDiagramModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
