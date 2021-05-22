import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { SwarmService } from "src/app/services/swarm.service";

@Component({
  selector: "app-swarm-edit",
  templateUrl: "./swarm-edit.page.html",
  styleUrls: ["./swarm-edit.page.scss"],
})
export class SwarmEditPage implements OnInit {
  swarmId: string;

  constructor(
    private swarmService: SwarmService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    console.log("Edit");
    this.swarmId = this.route.snapshot.params.swarmId;
  }
}
