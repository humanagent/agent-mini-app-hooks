export type AIAgent = {
  id: string;
  name: string;
  description: string;
  address: string;
};

export type AgentConfig = {
  name: string;
  address: string;
  networks: string[];
  live: boolean;
  suggestions?: string[];
  image?: string;
  domain?: string;
};

export const AI_AGENTS: AgentConfig[] = [
  {
    name: "elsa",
    address: "0xe15aa1ba585aea8a4639331ce5f9aec86f8c4541",
    networks: ["production"],
    live: true,
    suggestions: [
      "@elsa Help me write a creative story",
      "@elsa Generate ideas for a blog post",
      "@elsa Write a poem about technology",
    ],
    domain: "elsa.base.eth",
    image: "https://ipfs.io/ipfs/bafkreibjqv4kxzjx62hq5scjskkaocegji4rnyjf6avbxnz6u442szo2im",
  },
  {
    name: "flaunchy",
    address: "0x557463B158F70e4E269bB7BCcF6C587e3BC878F4",
    networks: ["production"],
    live: true,
    suggestions: [
      "@flaunchy Help me launch a new project",
      "@flaunchy Create a marketing strategy",
      "@flaunchy Generate launch ideas",
    ],
  },
  {
    name: "mamo",
    address: "0x99B10779557cc52c6E3a97C9A6C3446f021290cc",
    networks: ["production"],
    live: true,
    suggestions: [
      "@mamo Help me with my project",
      "@mamo Explain a technical concept",
      "@mamo Review my code",
    ],
    domain: "mamo.base.eth",
    image: "https://ipfs.io/ipfs/bafybeicgjmetc4iyla4k5ndm65xuvo6yutptloy3vdkydrat5u6tewijdu",
  },
  {
    name: "alphie.base.eth",
    address: "0x5154C8707f7Fa18961E03F5b51edB2fb56a206dc",
    networks: ["production"],
    live: true,
    suggestions: [
      "@alphie.base.eth Help with blockchain development",
      "@alphie.base.eth Explain smart contracts",
      "@alphie.base.eth Guide me through DeFi",
    ],
    domain: "alphie.base.eth",
    image: "https://ipfs.io/ipfs/bafkreibaa5gfjhisegdugksqb63bwkwstmbeitxc3hkpnq3ughtmpyioq4",
  },
  {
    name: "arma",
    address: "0x1456350CD79c51814567b0c1E767d3032dBD1647",
    networks: ["production"],
    live: true,
    suggestions: [
      "@arma Help me analyze data",
      "@arma Create a data visualization",
      "@arma Explain statistical concepts",
    ],
    domain: "armaxyz",
    image: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/1bf441eb-cc59-47d9-8fcc-f337c43fa600/original",
  },
  {
    name: "jesse",
    address: "0x2f9e2F8FdDEae391720D58D656a8Af0578006eD2",
    networks: ["production"],
    live: true,
    suggestions: [
      "@jesse Help me debug my code",
      "@jesse Optimize my algorithm",
      "@jesse Review my implementation",
    ],
    domain: "jessexbt.base.eth",
    image: "https://ipfs.io/ipfs/bafkreigqyohpla5hihjqrprmynmoroce6pf7a4hniv6t77ad6yy3em7nyq",
  },
  {
    name: "freysa",
    address: "0xEb7DB3ED8609165Ec5d99966CfDdeaE587070cD8",
    networks: ["production"],
    live: true,
    suggestions: [
      "@freysa Help me design a UI",
      "@freysa Create a color palette",
      "@freysa Suggest design improvements",
    ],
    domain: "hifreysa.base.eth",
    image: "https://ipfs.io/ipfs/bafkreihzf4frxkt3j42peowhm2w3ryihbbumfq6od5ace2xx2puwcyxwby",
  },
  {
    name: "neurobro",
    address: "0x9D2B24b027F4732BB87cD6531E16ce4Dc571c30c",
    networks: ["production"],
    live: true,
    suggestions: [
      "@neurobro Explain machine learning concepts",
      "@neurobro Help me train a model",
      "@neurobro Review my neural network",
    ],
  },
  {
    name: "bracky",
    address: "0x62db4c5A8fdF004754b9EFe92dF39927aB68920d",
    networks: ["production"],
    live: true,
    suggestions: [
      "@bracky Help me build a website",
      "@bracky Create a landing page",
      "@bracky Design a user interface",
    ],
  },
  {
    name: "bankr",
    address: "0x7f1c0d2955f873fc91f1728c19b2ed7be7a9684d",
    networks: ["production"],
    live: true,
    suggestions: [
      "@bankr Help with financial planning",
      "@bankr Analyze market trends",
      "@bankr Explain investment strategies",
    ],
    domain: "bankr.base.eth",
    image: "https://ipfs.io/ipfs/bafkreig3hwrxfm2zkzgvlja6kgctu6qcnwztbppxrkbikvhmspfj7bpnqu",
  },
  {
    name: "basemate",
    address: "0xB257b5C180b7b2cb80E35d6079AbE68D9CF0467F",
    networks: ["production"],
    live: true,
    domain: "askbasemate.base.eth",
    image: "https://ipfs.io/ipfs/bafkreib6sck2doq64pwx7zqq3mvgjf5odrtdenzp6kc36enfzjl7s6zs64",
    suggestions: [
      "@basemate Help with Base network",
      "@basemate Explain Layer 2 scaling",
      "@basemate Guide me through Base development",
    ],
  },
  {
    name: "echo",
    address: "0x194c31cae1418d5256e8c58e0d08aee1046c6ed0",
    networks: ["dev"],
    live: false,
    suggestions: [
      "@echo Help me test my code",
      "@echo Review my implementation",
      "@echo Debug an issue",
    ],
    domain: "hi.xmtp.eth",
    image: "https://ipfs.io/ipfs/QmaSZuaXfNUwhF7khaRxCwbhohBhRosVX1ZcGzmtcWnqav",
  },
  {
    name: "gm",
    address: "0x194c31cae1418d5256e8c58e0d08aee1046c6ed0",
    networks: ["dev", "production"],
    live: true,
    suggestions: [
      "@gm Good morning! How can I help?",
      "@gm Start a conversation",
      "@gm Get started with XMTP",
    ],
    domain: "hi.xmtp.eth",
    image: "https://ipfs.io/ipfs/QmaSZuaXfNUwhF7khaRxCwbhohBhRosVX1ZcGzmtcWnqav",
  },
  {
    name: "key-check",
    address: "0x235017975ed5F55e23a71979697Cd67DcAE614Fa",
    networks: ["dev", "production"],
    live: false,
    suggestions: [
      "@key-check Check my API keys",
      "@key-check Verify my configuration",
      "@key-check Test my setup",
    ],
    domain: "key-check.eth",
    image: "https://euc.li/key-check.eth",
  },
  {
    name: "xmtp-docs",
    address: "0x212906fdbdb70771461e6cb3376a740132e56b14",
    networks: ["production"],
    live: false,
    suggestions: [
      "@xmtp-docs How do I send a message?",
      "@xmtp-docs Explain XMTP concepts",
      "@xmtp-docs Show me code examples",
    ],
    domain: "xmtp-docs.eth",
  },
];
export function getAgentByAddress(address: string): AgentConfig | undefined {
  return AI_AGENTS.find((agent) => agent.address === address);
}

export function getAgentById(id: string): AIAgent | undefined {
  return AI_AGENTS.find((agent) => (agent as AIAgent).id === id);
}
