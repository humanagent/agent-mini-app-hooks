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
  image?: string;
  domain?: string;
  category?: string;
  description?: string;
};

export const AI_AGENTS: AgentConfig[] = [
  {
    name: "elsa",
    address: "0xe15aa1ba585aea8a4639331ce5f9aec86f8c4541",
    networks: ["production"],
    live: true,
    category: "Finance",
    description: "Financial assistance and guidance",
    domain: "elsa",
    image:
      "https://ipfs.io/ipfs/bafkreibjqv4kxzjx62hq5scjskkaocegji4rnyjf6avbxnz6u442szo2im",
  },
  {
    name: "flaunchy",
    address: "0x557463B158F70e4E269bB7BCcF6C587e3BC878F4",
    networks: ["production"],
    live: true,
    category: "Business",
    description: "Token launch and deployment assistance",
  },
  {
    name: "mamo",
    address: "0x99B10779557cc52c6E3a97C9A6C3446f021290cc",
    networks: ["production"],
    live: true,
    category: "Finance",
    description: "Banking and financial services",
    domain: "mamo",
    image:
      "https://ipfs.io/ipfs/bafybeicgjmetc4iyla4k5ndm65xuvo6yutptloy3vdkydrat5u6tewijdu",
  },
  {
    name: "alphie",
    address: "0x5154C8707f7Fa18961E03F5b51edB2fb56a206dc",
    networks: ["production"],
    live: true,
    category: "Games",
    description: "Blockchain development and smart contracts",
    domain: "alphie",
    image:
      "https://ipfs.io/ipfs/bafkreibaa5gfjhisegdugksqb63bwkwstmbeitxc3hkpnq3ughtmpyioq4",
  },
  {
    name: "arma",
    address: "0x1456350CD79c51814567b0c1E767d3032dBD1647",
    networks: ["production"],
    live: true,
    category: "Finance",
    description: "Banking and financial services",
    domain: "armaxyz",
    image:
      "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/1bf441eb-cc59-47d9-8fcc-f337c43fa600/original",
  },
  {
    name: "jesse",
    address: "0x2f9e2F8FdDEae391720D58D656a8Af0578006eD2",
    networks: ["production"],
    live: true,
    category: "Business",
    description: "Technical development and debugging",
    domain: "jessexbt",
    image:
      "https://ipfs.io/ipfs/bafkreigqyohpla5hihjqrprmynmoroce6pf7a4hniv6t77ad6yy3em7nyq",
  },
  {
    name: "freysa",
    address: "0xEb7DB3ED8609165Ec5d99966CfDdeaE587070cD8",
    networks: ["production"],
    live: true,
    category: "Finance",
    description: "Banking and financial services",
    domain: "hifreysa",
    image:
      "https://ipfs.io/ipfs/bafkreihzf4frxkt3j42peowhm2w3ryihbbumfq6od5ace2xx2puwcyxwby",
  },
  {
    name: "neurobro",
    address: "0x9D2B24b027F4732BB87cD6531E16ce4Dc571c30c",
    networks: ["production"],
    live: true,
    category: "Trading",
    description: "Trading and market analysis",
  },
  {
    name: "bracky",
    address: "0x62db4c5A8fdF004754b9EFe92dF39927aB68920d",
    networks: ["production"],
    live: true,
    category: "Trading",
    description: "Sports betting and odds analysis",
  },
  {
    name: "bankr",
    address: "0x7f1c0d2955f873fc91f1728c19b2ed7be7a9684d",
    networks: ["production"],
    live: true,
    category: "Trading",
    description: "Trading and market analysis",
    domain: "bankr",
    image:
      "https://ipfs.io/ipfs/bafkreig3hwrxfm2zkzgvlja6kgctu6qcnwztbppxrkbikvhmspfj7bpnqu",
  },
  {
    name: "basemate",
    address: "0xB257b5C180b7b2cb80E35d6079AbE68D9CF0467F",
    networks: ["production"],
    live: true,
    category: "Business",
    description: "Base network event management",
    domain: "askbasemate",
    image:
      "https://ipfs.io/ipfs/bafkreib6sck2doq64pwx7zqq3mvgjf5odrtdenzp6kc36enfzjl7s6zs64",
  },
  {
    name: "gm",
    address: "0x194c31cae1418d5256e8c58e0d08aee1046c6ed0",
    networks: ["production"],
    live: true,
    category: "Business",
    description: "Friendly greeting and conversation starter",
    domain: "hi.xmtp.eth",
    image:
      "https://ipfs.io/ipfs/QmaSZuaXfNUwhF7khaRxCwbhohBhRosVX1ZcGzmtcWnqav",
  },
  {
    name: "key-check",
    address: "0x235017975ed5F55e23a71979697Cd67DcAE614Fa",
    networks: ["production"],
    live: true,
    category: "Business",
    description: "QA agent for testing and verification",
    domain: "key-check.eth",
    image: "https://euc.li/key-check.eth",
  },
  {
    name: "xmtp-docs",
    address: "0x212906fdbdb70771461e6cb3376a740132e56b14",
    networks: ["production"],
    live: true,
    category: "Business",
    description: "XMTP documentation and code examples",
    domain: "xmtp-docs.eth",
  },
];

export function getAgentByAddress(address: string): AgentConfig | undefined {
  return AI_AGENTS.find((agent) => agent.address === address);
}

export function getAgentById(id: string): AgentConfig | undefined {
  return AI_AGENTS.find((agent) => agent.name === id || agent.domain === id);
}
