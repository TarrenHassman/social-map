import '../globals.js';
import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, SafeAreaView, Text } from 'react-native';
import { useAccessController } from '@orbitdb/core';
import { startOrbitDB } from './db-services.ts';
import { getAddress } from './utils.ts';
import { ComposedStorage, LRUStorage, IPFSBlockStorage } from '@orbitdb/core';
export default function App() {
  const [orbitdb, setOrbitDB] = useState(null);
  const [dbData, setDbData] = useState(null);

  // useAccessController(CyberflyAccessController);

  useEffect(() => {
    console.log('startOrbitDB');
    startOrbitDB().then(async (orbitdb) => {
      await setOrbitDB(orbitdb);
      console.log('orbitdb set');
      addData(orbitdb); // Call addData only after orbitdb is initialized
    });
  }, []);

  const addData = async (orbitdb: any) => {
    console.log('addData');
    try {
      const dbname =
        'testnewdb1235-94faf73efcd9af950d4dbca3e5c65459221377b6ea31e3ed30112939a5c79aa8';
      const addr = await getAddress(orbitdb, dbname);
      console.log(addr);
      
      // Create IPFS storage for heads and index
      const ipfsStorage = await IPFSBlockStorage({ ipfs: orbitdb.ipfs });
      
      const headsStorage = await ComposedStorage(
        await LRUStorage({ size: 1000 }),
        ipfsStorage
      );
      const indexStorage = await ComposedStorage(
        await LRUStorage({ size: 1000 }),
        ipfsStorage
      );
      const entryStorage = await ComposedStorage(
        await LRUStorage({ size: 1000 }),
        await IPFSBlockStorage({ ipfs: orbitdb.ipfs, pin: true }),
      );

      const accessController = {
        type: 'default',
        canAppend: async () => true,
        grant: async () => {},
        revoke: async () => {},
        save: async () => 'default',
        load: async () => {},
        close: async () => {}
      };

      const db = await orbitdb.open(dbname, {
        type: 'documents',
        AccessController: () => accessController,
        indexStorage,
        headsStorage,
        entryStorage,
      });
      // Add some records to the db.
      await db.put({
        _id: 0,
        publicKey:
          '94faf73efcd9af950d4dbca3e5c65459221377b6ea31e3ed30112939a5c79aa8',
        sig: 'df0dc7a643e696848ecbc45b9aeabf285c0be98c2ab91a6d0e54d1aaa65040211babf27fab8bb86a35cafbadf0b0acbb4952a9e9e99c1ff65092f97265983800',
        data: {
          latitude: -78.395184,
          longitude: 149.927618,
          member: 'chai kings',
          locationLabel: 'Coffee shop',
          streamName: 'mystream',
        },
      });
      // Print out the above records.
      const data = await db.all();
      setDbData(data);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView>
       <Text>
        Libp2p Node:{' '}
        {orbitdb ? orbitdb.ipfs.libp2p.peerId.toString() : 'Loading...'}
      </Text>
      {dbData && (
        <Text>
          DB Data: {JSON.stringify(dbData, null, 2)}
        </Text>
      )} 
      <Basic
      
      ></Basic>
    </SafeAreaView>
  );
}

export const Basic = () => {
  // const editor = useEditorBridge({
  //   autofocus: true,
  //   avoidIosKeyboard: true,
  //   initialContent,
  // });

  return (
    <SafeAreaView style={
      {
        flex: 1,
        backgroundColor: 'green',
        height: '100%',
        width: '100%',
      }
    }>
      <Text>Libp2p Node: </Text>
    </SafeAreaView>
  );
};


const initialContent = `<p>This is a basic example!</p>`;