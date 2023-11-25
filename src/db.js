const dbName = "mobilette";
function getRequest(){
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create an object store named "documents"
        const store = db.createObjectStore('documents', { keyPath: 'id'});

        // Additional code for creating indices goes here
        store.createIndex('lastOpenedIndex', 'lastOpened', { unique: false });
    };
    return request;
}


export function saveDocument(document) {
    return new Promise((resolve, reject) => {
        const request = getRequest();

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("documents", 'readwrite');
            const store = transaction.objectStore("documents");
            store.add(document);
            resolve();
        };

        request.onerror = (event) => {
            reject(`Database error:, ${event.target.error}`);
        };
    });
}


export function getDocuments() {
    return new Promise((resolve, reject) => {
        const request = getRequest();

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("documents", 'readonly');
            const store = transaction.objectStore("documents");
            const index = store.index('lastOpenedIndex'); // assuming 'lastOpened' is your timestamp field
            const cursorRequest = index.openCursor(null, 'prev'); // 'prev' for descending order

            const documents = [];
            cursorRequest.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    documents.push(cursor.value);
                    cursor.continue();
                }
                else{
                    resolve(documents);
                }
            };
        };

        request.onerror = (event) => {
            reject(`Database error:, ${event.target.error}`);
        };
    });
}

export function updateDocument(document) {
    return new Promise((resolve, reject) => {
        const request = getRequest();

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("documents", 'readwrite');
            const store = transaction.objectStore("documents");

            const getReq = store.get(document.id);
            getReq.onsuccess = () => {
                store.put(document);
                resolve();
            };
        };

        request.onerror = (event) => {
            reject(`Database error:, ${event.target.error}`);
        };
    });
}

export function deleteDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(dbName);

        request.onsuccess = () => {
            resolve(`Database ${dbName} deleted successfully.`);
        };

        request.onerror = (event) => {
            reject(`Error deleting database ${dbName}:`, event.target.error);
        };

        request.onblocked = () => {
            console.warn(`Delete operation blocked for database ${dbName}.`);
        };

    });
}


export function deleteDocument(documentId){
    return new Promise((resolve, reject) => {
        const request = getRequest();

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("documents", 'readwrite');
            const store = transaction.objectStore("documents");

            const getReq = store.delete(documentId);
            getReq.onsuccess = () => {
                resolve();
            };
        };

        request.onerror = (event) => {
            reject(`Database error:, ${event.target.error}`);
        };
    });
}
