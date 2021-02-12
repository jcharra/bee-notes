import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SwarmJournalPage } from './swarm-journal.page';

describe('SwarmJournalPage', () => {
  let component: SwarmJournalPage;
  let fixture: ComponentFixture<SwarmJournalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwarmJournalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SwarmJournalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
