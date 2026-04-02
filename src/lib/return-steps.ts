import { IP_ADDRESSES, type Step } from "./steps";

export const RETURN_STEPS: Step[] = [
  {
    id: 0,
    title: "The Website Responds",
    description:
      "The website has received Alice's request (from what it thinks is the Exit node). Now it sends a response - for example, an HTML page. But how does the response get back to Alice without revealing her identity?",
    messageAt: "website",
    encryptionLayers: 0,
    visibility: {
      website: {
        knows: ["Exit node IP address", "Response content"],
        cannotSee: ["Alice's IP address", "The relay path"],
      },
    },
    activeConnection: null,
    insight:
      "The website only knows the Exit node's address - it sends the response there, not to Alice directly.",
    packetLayers: [
      { color: "#fbbf24", label: '"{{MESSAGE}}"', from: IP_ADDRESSES.website, to: IP_ADDRESSES.exit, encrypted: false },
    ],
  },
  {
    id: 1,
    title: "Website Sends Response to Exit Node",
    description:
      'The website sends its response back to the Exit node\'s IP address - the only address it knows. The Exit node receives the plaintext response and encrypts it with the session key it shares with Alice (established during circuit setup). This is the first layer of the "return onion".',
    messageAt: "exit",
    encryptionLayers: 1,
    visibility: {
      exit: {
        knows: ["Response content", "Website address", "Middle node address"],
        cannotSee: ["Alice's IP address", "Guard node identity"],
      },
    },
    activeConnection: ["website", "exit"],
    insight:
      "The Exit wraps the response in encryption - the reverse of the outbound peeling begins.",
    packetLayers: [
      { color: "#3b82f6", label: "Encrypted with Exit's session key", from: IP_ADDRESSES.exit, to: IP_ADDRESSES.middle, encrypted: true },
      { color: "#fbbf24", label: '"{{MESSAGE}}"', from: "", to: "", encrypted: false },
    ],
  },
  {
    id: 2,
    title: "Exit Forwards to Middle Node",
    description:
      "The Exit node forwards the once-encrypted response to the Middle node because the Middle relay is the \"previous hop\" on the already-built circuit. The payload is already wrapped with the Exit's pre-negotiated session key (so only Alice can peel that layer later). Middle can't read what it contains; it simply wraps the whole payload in an additional layer using its own session key with Alice, growing the onion back to 2 layers.",
    messageAt: "middle",
    encryptionLayers: 2,
    visibility: {
      middle: {
        knows: ["Exit node address", "Guard node address"],
        cannotSee: ["Response content", "Alice's IP", "Website address"],
      },
    },
    activeConnection: ["exit", "middle"],
    insight:
      "Each node adds a layer on the way back - the onion is being rebuilt in reverse.",
    packetLayers: [
      { color: "#22c55e", label: "Encrypted with Middle's session key", from: IP_ADDRESSES.middle, to: IP_ADDRESSES.guard, encrypted: true },
      { color: "#3b82f6", label: "Encrypted with Exit's session key", from: "", to: "", encrypted: true },
      { color: "#fbbf24", label: '"{{MESSAGE}}"', from: "", to: "", encrypted: false },
    ],
  },
  {
    id: 3,
    title: "Middle Forwards to Guard Node",
    description:
      "The Middle node passes the 2-layer encrypted response to the Guard node. The Guard adds the third and final layer of encryption. The response is now wrapped in 3 layers - a complete return onion, just like the outbound message but in reverse.",
    messageAt: "guard",
    encryptionLayers: 3,
    visibility: {
      guard: {
        knows: ["Alice's IP address", "Middle node address"],
        cannotSee: ["Response content", "Website address", "Exit node identity"],
      },
    },
    activeConnection: ["middle", "guard"],
    insight:
      "The Guard still knows Alice's IP but has no idea what the response contains or where it came from originally.",
    packetLayers: [
      { color: "#ef4444", label: "Encrypted with Guard's session key", from: IP_ADDRESSES.guard, to: IP_ADDRESSES.alice, encrypted: true },
      { color: "#22c55e", label: "Encrypted with Middle's session key", from: "", to: "", encrypted: true },
      { color: "#3b82f6", label: "Encrypted with Exit's session key", from: "", to: "", encrypted: true },
      { color: "#fbbf24", label: '"{{MESSAGE}}"', from: "", to: "", encrypted: false },
    ],
  },
  {
    id: 4,
    title: "Guard Sends to Alice",
    description:
      "The Guard node sends the fully encrypted 3-layer return onion to Alice. To anyone watching the network, this looks like encrypted data flowing from the Guard to Alice - nothing about the website is visible.",
    messageAt: "alice",
    encryptionLayers: 3,
    visibility: {
      guard: {
        knows: ["Alice's IP address"],
        cannotSee: ["Response content", "Website address"],
      },
    },
    activeConnection: ["guard", "alice"],
    insight:
      "An observer sees Alice receiving data from the Guard - but not that it originated from a website.",
    packetLayers: [
      { color: "#ef4444", label: "Encrypted with Guard's session key", from: IP_ADDRESSES.guard, to: IP_ADDRESSES.alice, encrypted: true },
      { color: "#22c55e", label: "Encrypted with Middle's session key", from: "", to: "", encrypted: true },
      { color: "#3b82f6", label: "Encrypted with Exit's session key", from: "", to: "", encrypted: true },
      { color: "#fbbf24", label: '"{{MESSAGE}}"', from: "", to: "", encrypted: false },
    ],
  },
  {
    id: 5,
    title: "Alice Peels All 3 Layers",
    description:
      "Alice holds all 3 session keys (one for each relay). She decrypts the Guard's layer, then the Middle's layer, then the Exit's layer - peeling the return onion in order. After removing all 3 layers, she can read the website's original response!",
    messageAt: "alice",
    encryptionLayers: 0,
    visibility: {
      alice: {
        knows: ["Response content", "All 3 relay nodes", "Website address"],
        cannotSee: [],
      },
    },
    activeConnection: null,
    insight:
      "Alice is the only one who can unwrap all layers - she's the only one with all 3 session keys.",
    packetLayers: [
      { color: "#fbbf24", label: '"{{MESSAGE}}"', from: "", to: "", encrypted: false },
    ],
  },
  {
    id: 6,
    title: "The Full Circle",
    description:
      "The round trip is complete! Alice sent her message through 3 layers of encryption, each node peeled one layer on the way out. The response traveled back through the same circuit, each node added one layer, and Alice peeled them all. At no point did any single node see both Alice and the website.",
    messageAt: "alice",
    encryptionLayers: 0,
    visibility: {
      guard: {
        knows: ["Alice's IP"],
        cannotSee: ["Website", "Content"],
      },
      middle: {
        knows: ["Guard", "Exit"],
        cannotSee: ["Alice", "Website", "Content"],
      },
      exit: {
        knows: ["Website", "Content"],
        cannotSee: ["Alice", "Guard"],
      },
    },
    activeConnection: null,
    insight:
      "The same privacy guarantees hold in both directions - onion routing protects both the request and the response.",
  },
];
