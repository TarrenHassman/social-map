import {createHelia} from 'helia';
import {createOrbitDB, ComposedStorage, LRUStorage, IPFSBlockStorage} from '@orbitdb/core';
import {Identities, KeyStore} from '@orbitdb/core';
import {config} from './config/libp2pconfig';
import {createLibp2p} from 'libp2p';
import debug from 'debug';
import {LevelBlockstore} from './blockstore-level';

debug.enable('libp2p:*,*:trace');

const startOrbitDB = async () => {
  try {
    const libp2p = await createLibp2p(config);
    // const blockstore = new LevelBlockstore('ipfs_blockstore');
    const ipfs = await createHelia({libp2p, });
      // blockstore});
    const ipfsStorage = await IPFSBlockStorage({ipfs})
    const keyStorage = await ComposedStorage(
      await LRUStorage({size: 1000}),
      ipfsStorage
    );
    console.log('ComposedStorage Created')

    const keystore = await KeyStore({storage: keyStorage});
    const id = 'userA';
    const identities = await Identities({ipfs, keystore});

    const identity = await identities.createIdentity({id});
    const orbitdb = await createOrbitDB({ipfs, identity, identities});
    return orbitdb;
  } catch (e) {
    console.log(e);
  }
};

export {startOrbitDB};
