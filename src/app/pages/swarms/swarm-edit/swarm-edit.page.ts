import { Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { addYears, getYear } from "date-fns";
import { combineLatest, forkJoin, Observable } from "rxjs";
import { switchMap, tap } from "rxjs/operators";
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
  colonyForm: UntypedFormGroup;
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
    private formBuilder: UntypedFormBuilder
  ) {
    this.races = Object.keys(Race);
  }

  ngOnInit() {
    this.swarmId = this.route.snapshot.params.swarmId;
    this.groupId = this.route.snapshot.queryParams.groupId;

    this.ancestors$ = this.swarmService.getSwarms();

    this.colonyForm = this.formBuilder.group({
      name: [null, Validators.required],
      race: [null],
      birthYear: [getYear(new Date())],
      isNucleus: [null],
      ancestorId: [null],
      about: [null],
    });

    if (this.swarmId) {
      combineLatest([this.swarmService.getSwarm(this.swarmId), this.queenService.getStatus(this.swarmId)]).subscribe(
        ([swarm, status]) => {
          if (status) {
            status.race && this.colonyForm.controls.race.setValue(status.race);
            status.birthYear && this.colonyForm.controls.birthYear.setValue(status.birthYear);
          }

          if (swarm) {
            this.colonyForm.controls.isNucleus.setValue(!!swarm.isNucleus);
            swarm.name && this.colonyForm.controls.name.setValue(swarm.name);
            swarm.ancestorId && this.colonyForm.controls.ancestorId.setValue(swarm.ancestorId);
            swarm.about && this.colonyForm.controls.about.setValue(swarm.about);
          }
        }
      );
    } else {
      this.colonyForm.controls.isNucleus.setValue(true);
    }
  }

  changeBirthYear(diff: number) {
    const newVal = this.colonyForm.controls.birthYear.value + diff;
    if (newVal <= this.maxYear && newVal >= this.minYear) {
      this.colonyForm.controls.birthYear.setValue(newVal);
    }
  }

  save() {
    const vals = this.colonyForm.value;

    if (this.swarmId) {
      forkJoin([
        this.swarmService.updateSwarm({ id: this.swarmId, ...vals }),
        this.queenService.saveStatus(this.swarmId, vals),
      ]).subscribe(() => {
        this.router.navigateByUrl("/swarms/view/" + this.swarmId);
      });
    } else {
      this.swarmService
        .createSwarm(vals.name, vals.ancestorId, vals.isNucleus)
        .pipe(
          switchMap((swarmId: string) => {
            return forkJoin([
              this.queenService.saveStatus(swarmId, vals),
              this.swarmGroupService.addSwarmToGroup(swarmId, this.groupId),
            ]).pipe(
              tap(() => {
                this.router.navigateByUrl("/swarms/view/" + swarmId);
              })
            );
          })
        )
        .subscribe();
    }
  }
}
