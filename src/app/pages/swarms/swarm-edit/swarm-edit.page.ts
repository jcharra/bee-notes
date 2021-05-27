import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { addYears, getYear } from "date-fns";
import { Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { QueenService, Race } from "src/app/services/queen.service";
import { SwarmGroupService } from "src/app/services/swarm-group.service";
import { SwarmService } from "src/app/services/swarm.service";
import { Swarm } from "src/app/types/Swarm";

@Component({
  selector: "app-swarm-edit",
  templateUrl: "./swarm-edit.page.html",
  styleUrls: ["./swarm-edit.page.scss"],
})
export class SwarmEditPage implements OnInit {
  swarmId: string;
  groupId: string;
  colonyForm: FormGroup;
  races = [];
  maxYear = getYear(new Date());
  minYear = getYear(addYears(new Date(), -4));
  ancestors$: Observable<Swarm[]>;

  constructor(
    private swarmService: SwarmService,
    private swarmGroupService: SwarmGroupService,
    private queenService: QueenService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private formBuilder: FormBuilder
  ) {
    this.races = Object.keys(Race);
  }

  ngOnInit() {
    this.swarmId = this.route.snapshot.params.swarmId;
    this.groupId = this.route.snapshot.queryParams.groupId;

    this.ancestors$ = this.swarmService.getSwarms();

    this.colonyForm = this.formBuilder.group({
      name: [null, Validators.required],
      race: [Race.UNKNOWN],
      birthYear: [getYear(new Date())],
      isNucleus: [true],
      ancestorId: [null],
    });
  }

  changeBirthYear(diff: number) {
    const newVal = this.colonyForm.controls.birthYear.value + diff;
    if (newVal <= this.maxYear && newVal >= this.minYear) {
      this.colonyForm.controls.birthYear.setValue(newVal);
    }
  }

  save() {
    const vals = this.colonyForm.value;
    console.log("Value is", vals);
    this.swarmService
      .createSwarm(vals.name, vals.ancestorId)
      .pipe(
        switchMap((swarmId: string) => {
          return this.swarmGroupService.addSwarmToGroup(swarmId, this.groupId);
        })
      )
      .subscribe(() => {
        this.router.navigateByUrl("/swarms");
      });
  }
}
