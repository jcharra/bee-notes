import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { Storage } from "@ionic/storage";
import { isEqual } from "date-fns";
import { first, map } from "rxjs/operators";

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
  constructor(private db: AngularFireDatabase, private storage: Storage) {}

  getFromStorage(userId: string, key: LocalStorageKey) {
    return this.getCloudTimestamp(userId, key).pipe(
      map(async (ts) => {
        if (!ts) {
          return null;
        }

        const timestampFromCloud = new Date(ts);
        const storageEntry: StorageEntry = await this.storage.get(key);
        const timestampFromStorage = storageEntry
          ? storageEntry.timestamp
          : null;

        const dataFromStorage = storageEntry ? storageEntry.data : null;

        if (
          timestampFromCloud &&
          timestampFromStorage &&
          isEqual(timestampFromCloud, new Date(timestampFromStorage))
        ) {
          console.log("LOCAL RESULT:", dataFromStorage);
          return dataFromStorage;
        }
      })
    );
  }

  writeToStorage(userId: string, key: LocalStorageKey, data: any) {
    const timestamp = new Date();
    const storageEntry = {
      timestamp,
      data,
    };
    this.storage.set(key, storageEntry);
    this.setCloudTimestamp(userId, key, timestamp);
    console.log(`Wrote data with ts ${timestamp} to storage: ${data}`);
  }

  setCloudTimestamp(
    userId: string,
    key: LocalStorageKey,
    ts: Date
  ): Promise<void> {
    console.log("Set timestamp for", key, "to", ts, "for user", userId);
    return this.db
      .object(`users/${userId}/timestamp/`)
      .update({ [key]: ts.toISOString() });
  }

  private getCloudTimestamp(userId: string, key: LocalStorageKey) {
    return this.db
      .object(`users/${userId}/timestamp/${key}`)
      .valueChanges()
      .pipe(
        first(),
        map((val: Date) => {
          return val ? new Date(val) : null;
        })
      );
  }
}
