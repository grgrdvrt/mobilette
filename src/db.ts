import { Program, Registers } from "./store";

const dbName = "mobilette";
function getRequest() {
  const request = indexedDB.open(dbName, 1);

  request.addEventListener("upgradeneeded", (event: IDBVersionChangeEvent) => {
    const db = (event.target as IDBOpenDBRequest).result;

    // Create an object store named "documents"
    const store = db.createObjectStore("documents", { keyPath: "id" });

    // Additional code for creating indices goes here
    store.createIndex("lastOpenedIndex", "lastOpened", { unique: false });
  });
  return request;
}

export async function saveDocument(document: Program): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = getRequest();

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction("documents", "readwrite");
      const store = transaction.objectStore("documents");
      store.add(document);
      resolve();
    };

    request.onerror = (event) => {
      reject(`Database error:, ${(event.target as IDBOpenDBRequest).error}`);
    };
  });
}

export async function getDocuments(): Promise<Program[]> {
  return new Promise((resolve, reject) => {
    const request = getRequest();

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction("documents", "readonly");
      const store = transaction.objectStore("documents");
      const index = store.index("lastOpenedIndex"); // assuming 'lastOpened' is your timestamp field
      const cursorRequest = index.openCursor(null, "prev"); // 'prev' for descending order

      const documents: Program[] = [];
      cursorRequest.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest).result;
        if (cursor) {
          documents.push(cursor.value);
          cursor.continue();
        } else {
          //migration
          documents.forEach((d) => {
            if (Array.isArray(d.registers)) {
              d.registers = d.registers.reduce((acc, r) => {
                acc[r.id] = r;
                return acc;
              }, {} as Registers);
            }
          });
          resolve(documents);
        }
      };
    };

    request.onerror = (event) => {
      reject(`Database error:, ${(event.target as IDBOpenDBRequest).error}`);
    };
  });
}

export async function updateDocument(document: Program): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = getRequest();

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction("documents", "readwrite");
      const store = transaction.objectStore("documents");

      const getReq = store.get(document.id);
      getReq.onsuccess = () => {
        store.put(document);
        resolve();
      };
    };

    request.onerror = (event) => {
      reject(`Database error:, ${(event.target as IDBOpenDBRequest).error}`);
    };
  });
}

export async function deleteDatabase(): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);

    request.onsuccess = () => {
      resolve(`Database ${dbName} deleted successfully.`);
    };

    request.onerror = (event) => {
      reject(
        `Error deleting database ${dbName}:${(event.target as IDBOpenDBRequest).error}`,
      );
    };

    request.onblocked = () => {
      console.warn(`Delete operation blocked for database ${dbName}.`);
    };
  });
}

export async function deleteDocument(documentId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = getRequest();

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction("documents", "readwrite");
      const store = transaction.objectStore("documents");

      const getReq = store.delete(documentId);
      getReq.onsuccess = () => {
        resolve();
      };
    };

    request.onerror = (event) => {
      reject(`Database error:, ${(event.target as IDBOpenDBRequest).error}`);
    };
  });
}
