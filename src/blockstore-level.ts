import { BaseBlockstore } from 'blockstore-core'
import { DeleteFailedError, GetFailedError, NotFoundError, OpenFailedError, PutFailedError } from 'interface-store'
import { Level } from 'level'
import { base32upper } from 'multiformats/bases/base32'
import { CID } from 'multiformats/cid'
import * as raw from 'multiformats/codecs/raw'
import * as Digest from 'multiformats/hashes/digest'
import type { Pair } from 'interface-blockstore'
import type { AbortOptions, AwaitIterable } from 'interface-store'
import type { DatabaseOptions, OpenOptions, IteratorOptions } from 'level'
import type { MultibaseCodec } from 'multiformats/bases/interface'

export interface LevelBlockstoreInit extends DatabaseOptions<string, Uint8Array>, OpenOptions {
  /**
   * The multibase codec to use - nb. should be case insensitive.
   * default: base32upper
   */
  base?: MultibaseCodec<string>
}

/**
 * A blockstore backed by LevelDB
 */
export class LevelBlockstore extends BaseBlockstore {
  public db: Level<string, Uint8Array>
  private readonly opts: OpenOptions
  private readonly base: MultibaseCodec<string>

  constructor (path: string, init: LevelBlockstoreInit = {}) {
    super()
    path = path.replaceAll('/', '_')
    this.db = new Level<string, Uint8Array>(path, {
      valueEncoding: 'buffer',
      ...init
    })

    this.opts = {
      createIfMissing: true,
      compression: false,
      ...init
    }

    this.base = init.base ?? base32upper
  }

  #encode (cid: CID): string {
    return `/${this.base.encoder.encode(cid.multihash.bytes)}`
  }

  #decode (key: string): CID {
    return CID.createV1(raw.code, Digest.decode(this.base.decoder.decode(key.substring(1))))
  }

  async open (): Promise<void> {
    try {
      await this.db.open()
    } catch (err: any) {
      throw new OpenFailedError(String(err))
    }
  }

  async put (key: CID, value: Uint8Array): Promise<CID> {
    try {
      await this.db.put(this.#encode(key), value)
      return key
    } catch (err: any) {
      throw new PutFailedError(String(err))
    }
  }

  async get (key: CID): Promise<Uint8Array> {
    try {
      return await this.db.get(this.#encode(key))
    } catch (err: any) {
      if (err.notFound != null) {
        throw new NotFoundError(String(err))
      }
      throw new GetFailedError(String(err))
    }
  }

  async has (key: CID): Promise<boolean> {
    try {
      await this.db.get(this.#encode(key))
      return true
    } catch (err: any) {
      if (err.notFound != null) {
        return false
      }
      throw err
    }
  }

  async delete (key: CID): Promise<void> {
    try {
      await this.db.del(this.#encode(key))
    } catch (err: any) {
      throw new DeleteFailedError(String(err))
    }
  }

  async close (): Promise<void> {
    await this.db.close()
  }

  async * getAll (options?: AbortOptions): AwaitIterable<Pair> {
    for await (const { key, value } of this.#query({ values: true })) {
      yield { cid: this.#decode(key), block: value }
    }
  }

  async * #query (opts: { values: boolean, prefix?: string }): AsyncIterable<{ key: string, value: Uint8Array }> {
    const iteratorOpts: IteratorOptions<string, Uint8Array> = {
      keys: true,
      values: opts.values
    }

    if (opts.prefix != null) {
      const prefix = opts.prefix.toString()
      iteratorOpts.gte = prefix
      iteratorOpts.lt = prefix + '\\xFF'
    }

    const iterator = this.db.iterator(iteratorOpts)

    try {
      for await (const [key, value] of iterator) {
        yield { key: key.toString(), value }
      }
    } finally {
      await iterator.close()
    }
  }
}
