import { createHelia } from 'helia';
import { createOrbitDB, ComposedStorage, LRUStorage, IPFSBlockStorage } from '@orbitdb/core';
import { useIdentityProvider } from '@orbitdb/core';
import OrbitDBIdentityProviderEthereum from '@orbitdb/identity-provider-ethereum'
import { config } from './config/libp2pconfig';
import { createLibp2p } from 'libp2p';
import debug from 'debug';
import { Wallet } from '@ethersproject/wallet'
import './indexeddb-polyfill';

debug.enable('libp2p:*,*:trace');

const startOrbitDB = async () => {
  try {
    const libp2p = await createLibp2p(config);
    const ipfs = await createHelia({ libp2p, });
    // blockstore});
    const ipfsStorage = await IPFSBlockStorage({ ipfs })
    const keyStorage = await ComposedStorage(
      await LRUStorage({ size: 1000 }),
      ipfsStorage
    );
    console.log('ComposedStorage Created')

    const wallet = Wallet.createRandom()
    useIdentityProvider(OrbitDBIdentityProviderEthereum)
    console.log("test")
    const provider = OrbitDBIdentityProviderEthereum({wallet, storage: keyStorage})
    console.log("test")
    try {
      const orbitdb = await createOrbitDB({ 
        ipfs, 
        identity: provider, // Remove the object wrapper
        keyStorage,
        directory: './orbitdb' // Add explicit directory
      });
      console.log("OrbitDB created successfully");
      return orbitdb;
    } catch (error) {
      console.log("OrbitDB creation error:", error);
      console.log("Error details:", JSON.stringify(error, null, 2));
      throw error;
    }
  } catch (e) {
    console.log("Top level error:", e);
    console.log("Error stack:", e.stack);
    throw e;
  }
};

export { startOrbitDB };
