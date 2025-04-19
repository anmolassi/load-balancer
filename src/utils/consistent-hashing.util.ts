import { getHash } from "./hash.util";

type Server = {
  name: string;
  ip: string;
};

export class ConsistentHashing {
  private ring: Map<number, Server> = new Map();
  private sortedHashes: number[] = [];

  constructor(
    private servers: Server[],
    private virtualNodes = 3,
  ) {
    for (const server of servers) {
      for (let i = 0; i < virtualNodes; i++) {
        const key = getHash(`${server.ip}#${i}`);
        this.ring.set(key, server);
        this.sortedHashes.push(key);
      }
    }
    this.sortedHashes.sort((a, b) => a - b);
  }

  getServer(key: string): Server {
    const hash = getHash(key);
    for (const h of this.sortedHashes) {
      if (hash <= h) {
        return this.ring.get(h)!;
      }
    }
    return this.ring.get(this.sortedHashes[0])!;
  }
}
