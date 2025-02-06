import { noise } from '@chainsafe/libp2p-noise'; // Noise for secure communication
import { yamux } from '@chainsafe/libp2p-yamux'; // Yamux for stream multiplexing
import { identify } from '@libp2p/identify'; // Identify protocol for peer discovery
import { webRTC } from '@libp2p/webrtc'; // WebRTC transport for browser-to-browser communication
import { webSockets } from '@libp2p/websockets'; // WebSockets as a fallback transport
import { all } from '@libp2p/websockets/filters'; // Filter to allow all WebSocket connections
import { gossipsub } from '@chainsafe/libp2p-gossipsub'; // PubSub for decentralized messaging
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'; // Peer discovery via PubSub
import { dcutr } from '@libp2p/dcutr'; // DCUtR for hole-punching in NAT scenarios
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2';

export const config = {
  // Addresses to listen on
  addresses: {
    listen: [
      '/webrtc', // Prioritize WebRTC for direct browser-to-browser communication
      '/wss', // Fallback to WebSockets for compatibility
    ],
  },

  // Transports for communication
  transports: [
    webRTC(), // Primary transport for browser-to-browser communication
    webSockets({ filter: all }), // Fallback transport for broader compatibility
    circuitRelayTransport(),
  ],

  // Connection encryption
  connectionEncrypters: [noise()], // Use Noise for secure peer-to-peer communication

  // Stream multiplexing
  streamMuxers: [yamux()], // Use Yamux for efficient stream multiplexing

  // Services
  services: {
    identify: identify(), // Enable Identify protocol for peer discovery and metadata exchange
    pubsub: gossipsub({ // Enable PubSub for decentralized messaging
      allowPublishToZeroTopicPeers: true, // Allow publishing even if no peers are subscribed
      scoreThresholds: {
        gossipThreshold: -Infinity, // Disable gossip scoring thresholds
        publishThreshold: -Infinity, // Disable publish scoring thresholds
        graylistThreshold: -Infinity, // Disable graylisting
      },
    }),
    dcutr: dcutr(), // Enable DCUtR for NAT traversal (hole-punching)
  },

  // Peer discovery
  peerDiscovery: [
    pubsubPeerDiscovery({ // Use PubSub for peer discovery
      interval: 10000, // Discover peers every 10 seconds
      topics: ['browser-p2p-discovery'], // Custom topic for peer discovery
      listenOnly: false, // Actively announce presence to peers
    }),
  ],

  // Connection gater (optional, for advanced control)
  connectionGater: {
    denyDialMultiaddr: () => false, // Allow dialing any multiaddress
  },
};