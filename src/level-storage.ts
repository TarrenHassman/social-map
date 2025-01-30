import { Level } from 'level';

const LevelStorage = async ({ path = '' } = {}) => {
  const name = path.replaceAll('/', '_');

  const db = new Level(name, { valueEncoding: 'buffer' });
  await db.open();

  const put = async (hash, value) => {
    await db.put(hash, value);
  };

  const del = async (hash) => {
    try {
      await db.del(hash);
    } catch (e) {
      // Handle error if necessary
    }
  };

  const get = async (hash) => {
    try {
      return await db.get(hash);
    } catch (e) {
      // Handle LEVEL_NOT_FOUND (key not found)
    }
  };

  const iterator = async function* () {
    for await (const [key, value] of db.iterator()) {
      yield [key, value];
    }
  };

  const merge = (other) => {
    // Implement merging logic if needed
  };

  const clear = async () => {
    try {
      await db.clear();
    } catch (e) {
      // Handle error if necessary
    }
  };

  const close = async () => {
    await db.close();
  };

  return {
    put,
    del,
    get,
    iterator,
    merge,
    clear,
    close,
  };
};

export default LevelStorage;
