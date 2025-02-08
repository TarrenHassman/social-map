import localforage from 'localforage';

const createObjectStore = (name) => {
  const store = localforage.createInstance({
    name: name,
    storeName: name
  });

  return {
    put: async (value, key) => {
      await store.setItem(key, value);
      return { value, key };
    },
    get: async (key) => {
      return await store.getItem(key);
    },
    delete: async (key) => {
      await store.removeItem(key);
    },
    clear: async () => {
      await store.clear();
    },
    getAll: async () => {
      const keys = await store.keys();
      const values = await Promise.all(keys.map(key => store.getItem(key)));
      return values;
    },
    getAllKeys: async () => {
      return await store.keys();
    }
  };
};

const indexedDB = {
  open: (dbName) => {
    console.log("Opening IndexedDB:", dbName);
    const stores = new Map();
    
    const request = {
      result: null,
      error: null,
      onupgradeneeded: null,
      onsuccess: null,
      onerror: null
    };

    // Create the database result
    const db = {
      createObjectStore: (storeName, options = {}) => {
        console.log("Creating object store:", storeName);
        const store = createObjectStore(storeName);
        stores.set(storeName, store);
        return store;
      },
      transaction: (storeNames, mode) => ({
        objectStore: (name) => stores.get(name) || createObjectStore(name),
        oncomplete: null,
        onerror: null,
        commit: () => Promise.resolve()
      }),
      objectStoreNames: {
        contains: (name) => stores.has(name)
      }
    };

    // Simulate async opening
    setTimeout(() => {
      request.result = db;
      if (request.onsuccess) {
        request.onsuccess({ target: request });
      }
    }, 0);

    return request;
  },
  deleteDatabase: (dbName) => {
    const request = {
      result: null,
      error: null,
      onsuccess: null,
      onerror: null
    };

    localforage.dropInstance({ name: dbName })
      .then(() => {
        request.result = true;
        if (request.onsuccess) {
          request.onsuccess({ target: request });
        }
      })
      .catch(error => {
        request.error = error;
        if (request.onerror) {
          request.onerror({ target: request });
        }
      });

    return request;
  }
};

global.indexedDB = indexedDB;