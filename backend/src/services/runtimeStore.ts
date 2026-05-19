import fs from "fs/promises";
import path from "path";

type CollectionData = Record<string, unknown>;

const runtimeDir = path.resolve(process.cwd(), "data", "runtime");

const collectionFile = (name: string) => path.join(runtimeDir, `${name}.json`);

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const ensureRuntimeDir = async () => {
  await fs.mkdir(runtimeDir, { recursive: true });
};

const readCollectionFile = async (name: string): Promise<CollectionData> => {
  await ensureRuntimeDir();
  try {
    const raw = await fs.readFile(collectionFile(name), "utf8");
    return JSON.parse(raw) as CollectionData;
  } catch {
    return {};
  }
};

const writeCollectionFile = async (name: string, value: CollectionData) => {
  await ensureRuntimeDir();
  await fs.writeFile(
    collectionFile(name),
    JSON.stringify(value, null, 2),
    "utf8",
  );
};

let lock = Promise.resolve();

const withLock = async <T>(work: () => Promise<T>): Promise<T> => {
  const previous = lock;
  let release!: () => void;
  lock = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;

  try {
    return await work();
  } finally {
    release();
  }
};

export interface RuntimeDocSnapshot<T> {
  id: string;
  exists: boolean;
  data: () => T;
}

export interface RuntimeCollectionDoc<T> {
  id: string;
  data: T;
}

export class RuntimeTransaction {
  private touchedCollections = new Set<string>();

  constructor(private readonly state: Map<string, CollectionData>) {}

  private getCollectionData(name: string) {
    if (!this.state.has(name)) {
      this.state.set(name, {});
    }

    return this.state.get(name)!;
  }

  async getDoc<T>(
    collection: string,
    id: string,
  ): Promise<RuntimeDocSnapshot<T>> {
    const collectionData = this.getCollectionData(collection);
    const raw = collectionData[id] as T | undefined;
    return {
      id,
      exists: raw !== undefined,
      data: () => clone(raw as T),
    };
  }

  async listDocs<T>(collection: string): Promise<RuntimeCollectionDoc<T>[]> {
    const collectionData = this.getCollectionData(collection);
    return Object.entries(collectionData).map(([id, data]) => ({
      id,
      data: clone(data as T),
    }));
  }

  async queryDocs<T>(
    collection: string,
    field: keyof T,
    value: unknown,
  ): Promise<RuntimeCollectionDoc<T>[]> {
    const docs = await this.listDocs<T>(collection);
    return docs.filter(
      (doc) => (doc.data as Record<string, unknown>)[field as string] === value,
    );
  }

  setDoc<T>(collection: string, id: string, value: T, merge = false) {
    const collectionData = this.getCollectionData(collection);
    const existing = collectionData[id] as Record<string, unknown> | undefined;
    collectionData[id] =
      merge && existing
        ? { ...existing, ...(value as Record<string, unknown>) }
        : clone(value);
    this.touchedCollections.add(collection);
  }

  updateDoc<T extends object>(
    collection: string,
    id: string,
    patch: Partial<T>,
  ) {
    const collectionData = this.getCollectionData(collection);
    const existing = collectionData[id] as T | undefined;
    if (!existing) {
      throw new Error(`Document ${collection}/${id} does not exist`);
    }

    collectionData[id] = { ...existing, ...clone(patch) };
    this.touchedCollections.add(collection);
  }

  deleteDoc(collection: string, id: string) {
    const collectionData = this.getCollectionData(collection);
    delete collectionData[id];
    this.touchedCollections.add(collection);
  }

  async commit() {
    await Promise.all(
      Array.from(this.touchedCollections).map(async (collection) => {
        await writeCollectionFile(
          collection,
          this.getCollectionData(collection),
        );
      }),
    );
  }
}

const loadState = async (collectionNames: string[]) => {
  const state = new Map<string, CollectionData>();
  await Promise.all(
    collectionNames.map(async (collection) => {
      state.set(collection, await readCollectionFile(collection));
    }),
  );
  return state;
};

export const runtimeStore = {
  async listDocs<T>(collection: string) {
    const data = await readCollectionFile(collection);
    return Object.entries(data).map(([id, value]) => ({
      id,
      data: clone(value as T),
    }));
  },

  async getDoc<T>(
    collection: string,
    id: string,
  ): Promise<RuntimeDocSnapshot<T>> {
    const data = await readCollectionFile(collection);
    const raw = data[id] as T | undefined;
    return {
      id,
      exists: raw !== undefined,
      data: () => clone(raw as T),
    };
  },

  async setDoc<T>(collection: string, id: string, value: T, merge = false) {
    await withLock(async () => {
      const data = await readCollectionFile(collection);
      const existing = data[id] as Record<string, unknown> | undefined;
      data[id] =
        merge && existing
          ? { ...existing, ...(value as Record<string, unknown>) }
          : clone(value);
      await writeCollectionFile(collection, data);
    });
  },

  async updateDoc<T extends object>(
    collection: string,
    id: string,
    patch: Partial<T>,
  ) {
    await withLock(async () => {
      const data = await readCollectionFile(collection);
      const existing = data[id] as T | undefined;
      if (!existing) {
        throw new Error(`Document ${collection}/${id} does not exist`);
      }

      data[id] = { ...existing, ...clone(patch) };
      await writeCollectionFile(collection, data);
    });
  },

  async queryDocs<T>(collection: string, field: keyof T, value: unknown) {
    const docs = await this.listDocs<T>(collection);
    return docs.filter(
      (doc) => (doc.data as Record<string, unknown>)[field as string] === value,
    );
  },

  async runTransaction<T>(work: (tx: RuntimeTransaction) => Promise<T>) {
    return withLock(async () => {
      const collections = [
        "leads",
        "providers",
        "leadAssignments",
        "allocationState",
        "services",
        "webhookEvents",
      ];
      const state = await loadState(collections);
      const tx = new RuntimeTransaction(state);
      const result = await work(tx);
      await tx.commit();
      return result;
    });
  },
};
