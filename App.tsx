import './globals.js';
import { StyleSheet, Text, View } from 'react-native';
import { useState, useEffect } from 'react';
import { createLibp2p } from 'libp2p';
import debug from 'debug'
import { config } from './config/libp2pconfig';


debug.enable('libp2p:*,*:trace')
export default function App() {
  const [libp2p, setLibp2p] = useState(null);

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
  libp2p.addEventListener("peer:discovery", (x) => {
    console.log(
      "Discovered: ",
      x.detail.id.toString(),
      x.detail.multiaddrs.map((a) => a.toString()),
    );
  });
  libp2p.addEventListener("peer:connect", () => {
    console.log("Peers: ", libp2p.getPeers());
  });
}
  },[libp2p])

  return (
    <View style={styles.container}>
      <Text>js-libp2p running on React Native</Text>
      <Text>Our PeerId is {libp2p?.peerId.toString()}</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    fontSize: 20,
    fontStyle: 'italic',
    alignItems: 'center',
  },
});