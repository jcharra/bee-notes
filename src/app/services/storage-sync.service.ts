import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { differenceInMilliseconds, isEqual } from "date-fns";
import { of } from "rxjs";
import { first, map } from "rxjs/operators";
import { StorageService } from "./storage.service";

export enum LocalStorageKey {
  SWARMS = "swarms",
  JOURNAL_ENTRIES = "journal_entries",
}

interface StorageEntry {
  timestamp: Date;
  data: any;
}

@Injectable({
  providedIn: "root",
})
export class StorageSyncService {
  constructor(
    private db: AngularFireDatabase,
    private storageService: StorageService
  ) {}

  async getFromStorage(key: LocalStorageKey) {
    const start = new Date();

    const storageEntry: StorageEntry = await this.storageService.get(key);
    const dataFromStorage = storageEntry ? storageEntry.data : null;

    console.log("LOCAL RESULT:", dataFromStorage);
    console.log(`Took ${differenceInMilliseconds(new Date(), start)} ms`);
    return dataFromStorage;
  }

  writeToStorage(key: LocalStorageKey, data: any) {
    const timestamp = new Date();
    const storageEntry = {
      timestamp,
      data,
    };
    this.storageService.set(key, storageEntry);
    console.log(`Wrote data with ts ${timestamp} to storage: ${data}`);
  }

  clearFromStorage(key: LocalStorageKey) {
    this.storageService.remove(key);
  }
}
