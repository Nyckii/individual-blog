import { IP_ADDRESSES, type Step } from "./steps";

export const CIRCUIT_STEPS: Step[] = [
  {
    id: 0,
    title: "Why Do We Need Circuit Setup?",
    description:
      "Before Alice can send any data, she needs a shared secret key with each relay node. These keys will be used to encrypt and decrypt the onion layers. But how can Alice establish a secret with the Middle node if the Middle node doesn't even know Alice exists?",
    messageAt: null,
    encryptionLayers: 0,
    visibility: {},
    activeConnection: null,
    insight:
      "The Diffie-Hellman key exchange lets two parties create a shared secret over a public channel, even if someone is watching.",
  },
  {
    id: 1,
    title: "Step 1: Key Exchange with Guard",
    description:
      "Alice connects directly to the Guard node and performs a Diffie-Hellman key exchange. They each pick a secret, mix it with a public value, exchange the mixed results, and both arrive at the same shared session key. Now Alice and the Guard share a secret that no eavesdropper can derive.",
    messageAt: "guard",
    encryptionLayers: 0,
    visibility: {
      alice: {
        knows: ["Guard's IP address", "Session key with Guard"],
        cannotSee: [],
      },
      guard: {
        knows: ["Alice's IP address", "Session key with Alice"],
        cannotSee: [],
      },
    },
    activeConnection: ["alice", "guard"],
    insight:
      "This first key exchange happens directly. Alice and the Guard can now communicate privately.",
  },
  {
    id: 2,
    title: "Step 2: Extending to Middle (Through the Guard)",
    description:
      'Alice wants to establish a key with the Middle node, but she doesn\'t connect directly. Instead, she sends her Diffie-Hellman values through the encrypted tunnel she already has with the Guard. The Guard forwards the data to the Middle without being able to read it (it\'s encrypted end-to-end). The Guard acts as a "blind postman."',
    messageAt: "middle",
    encryptionLayers: 1,
    visibility: {
      alice: {
        knows: ["Session key with Guard", "Session key with Middle"],
        cannotSee: [],
      },
      guard: {
        knows: ["Alice's IP", "Middle's address"],
        cannotSee: ["Session key between Alice & Middle"],
      },
      middle: {
        knows: ["Session key with circuit initiator", "Guard's address"],
        cannotSee: ["Alice's IP address"],
      },
    },
    activeConnection: ["guard", "middle"],
    insight:
      "The Guard forwards the key exchange but can't read it. The Middle gets a session key with 'someone' it doesn't know is Alice.",
    packetLayers: [
      { color: "#ef4444", label: "Encrypted with Guard's session key", from: IP_ADDRESSES.alice, to: IP_ADDRESSES.guard, encrypted: true },
      { color: "#fbbf24", label: "DH key exchange → Middle node", from: "", to: "", encrypted: false },
    ],
  },
  {
    id: 3,
    title: "Step 3: Extending to Exit (Through Guard + Middle)",
    description:
      "Alice repeats the process one more time. She sends her Diffie-Hellman values to the Exit node, encrypted first with the Middle's key, then with the Guard's key. It travels through both relays like a mini-onion. Neither the Guard nor the Middle can read the key exchange with the Exit.",
    messageAt: "exit",
    encryptionLayers: 2,
    visibility: {
      alice: {
        knows: [
          "Session key with Guard",
          "Session key with Middle",
          "Session key with Exit",
        ],
        cannotSee: [],
      },
      guard: {
        knows: ["Alice's IP", "Middle's address"],
        cannotSee: ["Session key Alice↔Middle", "Session key Alice↔Exit", "Exit node identity"],
      },
      middle: {
        knows: ["Guard's address", "Exit's address"],
        cannotSee: ["Alice's IP", "Session key Alice↔Guard", "Session key Alice↔Exit"],
      },
      exit: {
        knows: ["Session key with circuit initiator", "Middle's address"],
        cannotSee: ["Alice's IP", "Guard's identity"],
      },
    },
    activeConnection: ["middle", "exit"],
    insight:
      "Each extension is tunneled through all previous nodes. They forward data they can't read.",
    packetLayers: [
      { color: "#ef4444", label: "Encrypted with Guard's session key", from: IP_ADDRESSES.alice, to: IP_ADDRESSES.guard, encrypted: true },
      { color: "#22c55e", label: "Encrypted with Middle's session key", from: "", to: IP_ADDRESSES.middle, encrypted: true },
      { color: "#fbbf24", label: "DH key exchange → Exit node", from: "", to: "", encrypted: false },
    ],
  },
  {
    id: 4,
    title: "Circuit Complete!",
    description:
      "Alice now has 3 independent session keys, one with each relay node. Crucially, each node only knows its own session key. The Guard doesn't know the Middle's or Exit's key. The Middle doesn't know the Guard's or Exit's key. And none of them know that all 3 keys belong to the same person (Alice). The circuit is ready to carry onion-encrypted data!",
    messageAt: null,
    encryptionLayers: 0,
    visibility: {
      guard: {
        knows: ["Alice's IP", "Key with Alice", "Middle's address"],
        cannotSee: ["Other session keys", "Exit identity"],
      },
      middle: {
        knows: ["Key with initiator", "Guard address", "Exit address"],
        cannotSee: ["Alice's IP", "Other session keys"],
      },
      exit: {
        knows: ["Key with initiator", "Middle's address"],
        cannotSee: ["Alice's IP", "Guard identity", "Other session keys"],
      },
    },
    activeConnection: null,
    insight:
      "Three independent keys, three nodes that don't know each other's keys. The circuit is ready for onion routing.",
  },
];
