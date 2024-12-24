import './globals.js';
import React, { useState, useEffect } from 'react';
import { createLibp2p } from 'libp2p';
import { toString } from 'uint8arrays/to-string'
import debug from 'debug'
import { config } from './config/libp2pconfig';
import { SafeAreaView, Text } from 'react-native';
import { createHelia } from 'helia'
import { createOrbitDB, useAccessController } from '@orbitdb/core'
//import { LevelBlockstore } from 'blockstore-level'
import { MemoryStorage} from '@orbitdb/core/src/storage/index.js'
import { Identities, KeyStore } from '@orbitdb/core'
import CyberflyAccessController from './cyberfly-access-controller'

debug.enable('libp2p:*,*:trace')
export default function App() {

  const [libp2p, setLibp2p] = useState(null);
  //const blockstore = new LevelBlockstore('./ipfs/blocks')
  useAccessController(CyberflyAccessController)
  useEffect(() => {
    async function getLibp2p() {
      try {
        const node = await createLibp2p(config);
        console.log(node.peerId.toString())
        if (node) {
          console.log('Libp2p node created:', node);
          setLibp2p(node);
        } else {
          console.error('Libp2p node creation returned null');
        }
      } catch (error) {
        console.error('Error creating Libp2p node:', error);
      }
    }

    getLibp2p();
  }, []);

  useEffect(()=>{
if(libp2p){
   /*libp2p.addEventListener("peer:discovery", (x) => {
    console.log(
      "Discovered: ",
      x.detail.id.toString(),
      x.detail.multiaddrs.map((a) => a.toString()),
    );
  });
 libp2p.addEventListener("peer:connect", () => {
    console.log("Peers: ", libp2p.getPeers());
  });*/
  libp2p.services.pubsub.subscribe(libp2p.peerId.toString())
  libp2p.services.pubsub.addEventListener("message", async(message)=>{
    const { topic, data, from } = message.detail
    if(topic==libp2p.peerId.toString()){
      console.log(toString(data))
      console.log(from)
    }
  })
}
  },[libp2p])


  useEffect(()=>{
    if(libp2p){
async function getorbitdb(){
 
    const entryStorage = await  MemoryStorage()
    const headsStorage = await MemoryStorage()
    const indexStorage = await MemoryStorage()
    const keyStorage = await MemoryStorage()
    const ipfs = await createHelia({ libp2p })
    const keystore = await KeyStore({storage: keyStorage})
    const id = 'userA'
   const identities = await Identities({ ipfs,keystore })
   const identity = await identities.createIdentity({ id })
    const orbitdb = await createOrbitDB({ ipfs,identity, identities})
  
    const db = await orbitdb.open('testnewdb1235-94faf73efcd9af950d4dbca3e5c65459221377b6ea31e3ed30112939a5c79aa8', {type:'documents',AccessController:CyberflyAccessController(), entryStorage, headsStorage, indexStorage })
        
    // Add some records to the db.
    try{
    await db.put({_id:Math.random(), publicKey:"94faf73efcd9af950d4dbca3e5c65459221377b6ea31e3ed30112939a5c79aa8", 
      sig:"df0dc7a643e696848ecbc45b9aeabf285c0be98c2ab91a6d0e54d1aaa65040211babf27fab8bb86a35cafbadf0b0acbb4952a9e9e99c1ff65092f97265983800",
    data:{
      latitude: -78.395184,
      longitude: 149.927618,
      member: 'chai kings',
      locationLabel: 'Coffee shop',
      streamName: 'mystream'
    }})    
    // Print out the above records.
    console.log(await db.all())
  }
  catch(e){
    console.log(e)
  }

}
getorbitdb()
    }
    
  },[libp2p])

  return (
    <SafeAreaView>

      <Text>Libp2p Node: {libp2p ? libp2p.peerId.toString() : 'Loading...'}</Text>
    </SafeAreaView>    );
}