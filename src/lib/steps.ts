export interface NodeVisibility {
  knows: string[];
  cannotSee: string[];
}

export interface PacketLayer {
  color: string;
  label: string;
  from: string;
  to: string;
  encrypted: boolean;
}

export interface Step {
  id: number;
  title: string;
  description: string;
  /** Which node the message is currently at (null = not sent yet) */
  messageAt: string | null;
  /** How many encryption layers remain on the message (3 = fully wrapped) */
  encryptionLayers: number;
  /** What each node can see at this step */
  visibility: Record<string, NodeVisibility>;
  /** Which connection is actively transmitting */
  activeConnection: [string, string] | null;
  /** Highlight text for the key insight */
  insight: string;
  /** Packet layers to display (null = no packet diagram). Use {{MESSAGE}} as placeholder. */
  packetLayers?: PacketLayer[] | null;
  /** Whether the step is a "challenge" step */
}

export const IP_ADDRESSES: Record<string, string> = {
  alice: "192.168.1.42",
  guard: "85.214.47.13",
  middle: "104.244.72.115",
  exit: "198.51.100.89",
  website: "93.184.216.34",
};

export const NODES = [
  { id: "alice", label: "Alice", x: 0, y: 80 },
  { id: "guard", label: "Guard Node", x: 25, y: 20 },
  { id: "middle", label: "Middle Node", x: 50, y: 80 },
  { id: "exit", label: "Exit Node", x: 75, y: 20 },
  { id: "website", label: "Website", x: 100, y: 80 },
] as const;

export const CONNECTIONS = [
  ["alice", "guard"],
  ["guard", "middle"],
  ["middle", "exit"],
  ["exit", "website"],
] as const;

export const STEPS: Step[] = [
  {
    id: 0,
    title: "The Problem",
    description:
      "Alice wants to visit a website privately. But on a normal internet connection, her ISP, network administrators, and anyone watching the network can see exactly which website she's connecting to, and the website can see her IP address.",
    messageAt: null,
    encryptionLayers: 0,
    visibility: {},
    activeConnection: null,
    insight:
      "On a normal connection, there's no privacy. Everyone in the middle can see both who you are and where you're going.",
  },
  {
    id: 1,
    title: "Alice Picks a Random Path",
    description:
      "Alice's Tor client selects 3 relay nodes from a public directory: a Guard node, a Middle node, and an Exit node. She downloads each node's public encryption key. This random 3-hop path is called a \"circuit\".",
    messageAt: null,
    encryptionLayers: 0,
    visibility: {},
    activeConnection: null,
    insight:
      "The path is random: no single node is chosen by anyone who could compromise it.",
  },
  {
    id: 2,
    title: "Setting Up the Circuit: Session Keys",
    description:
      "Before sending her message, Alice establishes a shared secret key with each relay node, one at a time. She first negotiates a session key with the Guard, then (through the Guard) with the Middle node, and finally (through both) with the Exit node. This uses a technique called Diffie-Hellman key exchange, which lets two parties agree on a secret key even over an insecure channel. Now Alice has 3 session keys, one for each hop, and each node only knows its own key.",
    messageAt: null,
    encryptionLayers: 0,
    visibility: {
      alice: {
        knows: ["Guard session key", "Middle session key", "Exit session key"],
        cannotSee: [],
      },
      guard: {
        knows: ["Guard session key"],
        cannotSee: ["Middle session key", "Exit session key"],
      },
      middle: {
        knows: ["Middle session key"],
        cannotSee: ["Guard session key", "Exit session key"],
      },
      exit: {
        knows: ["Exit session key"],
        cannotSee: ["Guard session key", "Middle session key"],
      },
    },
    activeConnection: null,
    insight:
      "Each relay only knows its own session key. Alice knows all three, and this is what allows her to build (and later unwrap) the encryption layers.",
  },
  {
    id: 3,
    title: "Building the Onion: 3 Layers of Encryption",
    description:
      "Alice encrypts her message in 3 layers, like wrapping a letter in 3 sealed envelopes. The innermost layer (blue) is encrypted with the Exit node's key, the middle layer (green) with the Middle node's key, and the outermost layer (red) with the Guard node's key. This is why it's called \"onion\" routing!",
    messageAt: "alice",
    encryptionLayers: 3,
    visibility: {
      alice: {
        knows: ["Full message", "All 3 relay nodes", "Destination website"],
        cannotSee: [],
      },
    },
    activeConnection: null,
    insight:
      "Each layer can only be decrypted by the corresponding node's session key. No single node can unwrap all layers.",
    packetLayers: [
      {
        color: "#ef4444",
        label: "Encrypted with Guard's key",
        from: IP_ADDRESSES.alice,
        to: IP_ADDRESSES.guard,
        encrypted: true,
      },
      {
        color: "#22c55e",
        label: "Encrypted with Middle's key",
        from: "",
        to: IP_ADDRESSES.middle,
        encrypted: true,
      },
      {
        color: "#3b82f6",
        label: "Encrypted with Exit's key",
        from: "",
        to: IP_ADDRESSES.exit,
        encrypted: true,
      },
      {
        color: "#fbbf24",
        label: '"{{MESSAGE}}"  →  ' + IP_ADDRESSES.website,
        from: "",
        to: "",
        encrypted: false,
      },
    ],
  },
  {
    id: 4,
    title: "Sending to the Guard Node",
    description:
      "Alice sends the fully encrypted onion to the Guard node. The Guard node is the only node that knows Alice's real IP address, but it receives a blob encrypted in 3 layers and has no idea what's inside beyond the first layer.",
    messageAt: "guard",
    encryptionLayers: 3,
    visibility: {
      guard: {
        knows: ["Alice's IP address"],
        cannotSee: [
          "Message content",
          "Final destination",
          "Middle node identity",
        ],
      },
    },
    activeConnection: ["alice", "guard"],
    insight: "The Guard knows WHO is sending, but not WHAT or WHERE.",
    packetLayers: [
      {
        color: "#ef4444",
        label: "Encrypted with Guard's key",
        from: IP_ADDRESSES.alice,
        to: IP_ADDRESSES.guard,
        encrypted: true,
      },
      {
        color: "#22c55e",
        label: "Encrypted with Middle's key",
        from: "",
        to: IP_ADDRESSES.middle,
        encrypted: true,
      },
      {
        color: "#3b82f6",
        label: "Encrypted with Exit's key",
        from: "",
        to: IP_ADDRESSES.exit,
        encrypted: true,
      },
      {
        color: "#fbbf24",
        label: '"{{MESSAGE}}"  →  ' + IP_ADDRESSES.website,
        from: "",
        to: "",
        encrypted: false,
      },
    ],
  },
  {
    id: 5,
    title: "Guard Peels Layer 1",
    description:
      "The Guard node decrypts the outermost layer (red) using its private key. Inside, it finds the address of the Middle node and another encrypted blob, but it can't read anything else. It forwards the remaining 2-layer onion to the Middle node.",
    messageAt: "middle",
    encryptionLayers: 2,
    visibility: {
      guard: {
        knows: ["Alice's IP address", "Middle node address"],
        cannotSee: [
          "Message content",
          "Final destination",
          "Exit node identity",
        ],
      },
      middle: {
        knows: ["Guard node address"],
        cannotSee: [
          "Alice's IP address",
          "Message content",
          "Final destination",
        ],
      },
    },
    activeConnection: ["guard", "middle"],
    insight:
      "After peeling one layer, the Guard only learns where to send next, nothing about the final destination.",
    packetLayers: [
      {
        color: "#22c55e",
        label: "Encrypted with Middle's key",
        from: IP_ADDRESSES.guard,
        to: IP_ADDRESSES.middle,
        encrypted: true,
      },
      {
        color: "#3b82f6",
        label: "Encrypted with Exit's key",
        from: "",
        to: IP_ADDRESSES.exit,
        encrypted: true,
      },
      {
        color: "#fbbf24",
        label: '"{{MESSAGE}}"  →  ' + IP_ADDRESSES.website,
        from: "",
        to: "",
        encrypted: false,
      },
    ],
  },
  {
    id: 6,
    title: "Middle Node Peels Layer 2",
    description:
      "The Middle node decrypts its layer (green) using its private key. It discovers the Exit node's address and a final encrypted blob. It knows it received data from the Guard and should send it to the Exit, but it doesn't know who Alice is or what the message says.",
    messageAt: "exit",
    encryptionLayers: 1,
    visibility: {
      middle: {
        knows: ["Guard node address", "Exit node address"],
        cannotSee: [
          "Alice's IP address",
          "Message content",
          "Final destination",
        ],
      },
      exit: {
        knows: ["Middle node address"],
        cannotSee: ["Alice's IP address", "Guard node identity"],
      },
    },
    activeConnection: ["middle", "exit"],
    insight:
      'The Middle node is the most "blind": it knows neither the sender nor the destination.',
    packetLayers: [
      {
        color: "#3b82f6",
        label: "Encrypted with Exit's key",
        from: IP_ADDRESSES.middle,
        to: IP_ADDRESSES.exit,
        encrypted: true,
      },
      {
        color: "#fbbf24",
        label: '"{{MESSAGE}}"  →  ' + IP_ADDRESSES.website,
        from: "",
        to: "",
        encrypted: false,
      },
    ],
  },
  {
    id: 7,
    title: "Exit Node Peels Layer 3",
    description:
      "The Exit node decrypts the final layer (blue) using its private key. Now it can see the original message and the destination website, but it has no idea who sent it! It only knows it received data from the Middle node.",
    messageAt: "website",
    encryptionLayers: 0,
    visibility: {
      exit: {
        knows: [
          "Middle node address",
          "Destination website",
          "Message content",
        ],
        cannotSee: ["Alice's IP address", "Guard node identity"],
      },
      website: {
        knows: ["Exit node IP address", "Message content"],
        cannotSee: ["Alice's IP address", "The entire relay path"],
      },
    },
    activeConnection: ["exit", "website"],
    insight:
      "The Exit sees WHAT is being sent and WHERE, but not WHO sent it. The website thinks the Exit node is the sender!",
    packetLayers: [
      {
        color: "#fbbf24",
        label: '"{{MESSAGE}}"',
        from: IP_ADDRESSES.exit,
        to: IP_ADDRESSES.website,
        encrypted: false,
      },
    ],
  },
  {
    id: 8,
    title: "No Single Point Knows Everything",
    description:
      "That's the magic of onion routing! By splitting knowledge across 3 nodes, no single entity can link Alice to her destination. The Guard knows Alice but not the website. The Exit knows the website but not Alice. The Middle knows neither.",
    messageAt: "website",
    encryptionLayers: 0,
    visibility: {
      guard: {
        knows: ["Alice's IP"],
        cannotSee: ["Destination", "Message"],
      },
      middle: {
        knows: ["Guard", "Exit"],
        cannotSee: ["Alice", "Destination", "Message"],
      },
      exit: {
        knows: ["Destination", "Message"],
        cannotSee: ["Alice", "Guard"],
      },
    },
    activeConnection: null,
    insight:
      "Privacy through separation of knowledge: no single relay can see the full picture.",
    packetLayers: [
      {
        color: "#fbbf24",
        label: '"{{MESSAGE}}"',
        from: IP_ADDRESSES.exit,
        to: IP_ADDRESSES.website,
        encrypted: false,
      },
    ],
  },
];
