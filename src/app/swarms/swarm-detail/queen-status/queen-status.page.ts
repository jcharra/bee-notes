import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { getYear } from "date-fns";
import { QueenService, QueenStatus } from "src/app/queen.service";

@Component({
  selector: "app-queen-status",
  templateUrl: "./queen-status.page.html",
  styleUrls: ["./queen-status.page.scss"],
})
export class QueenStatusPage implements OnInit {
  queenStatus: QueenStatus;
  colonyId: string;

  constructor(
    private route: ActivatedRoute,
    private queenService: QueenService
  ) {}

  ngOnInit() {
    this.colonyId = this.route.snapshot.params.swarmId;
    this.queenService
      .getStatus(this.colonyId)
      .subscribe((status: QueenStatus) => {
        console.log("STatus", status);
        this.queenStatus = status || {
          birthYear: getYear(new Date()),
        };
        console.log("STatus", this.queenStatus);
      });
  }

  incrementBirthYear() {}

  decrementBirthYear() {}
}
