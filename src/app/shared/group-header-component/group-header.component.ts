import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { UISwarmGroup } from "src/app/pages/swarms/swarms.page";

@Component({
  selector: "app-group-header",
  templateUrl: "./group-header.component.html",
  styleUrls: ["./group-header.component.scss"],
})
export class GroupHeaderComponent implements OnInit {
  @Input() idx: number;
  @Input() group: UISwarmGroup;
  @Output() renameEvent = new EventEmitter<string>();

  constructor() {}

  ngOnInit() {}

  rename(gid: string) {
    this.renameEvent.emit(gid);
  }
}
