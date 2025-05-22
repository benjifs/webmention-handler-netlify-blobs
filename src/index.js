import { getStore, listStores } from '@netlify/blobs'

// https://docs.netlify.com//blobs/overview/
export default class BlobStorage {
	#options

	constructor({ siteID, token }) {
		this.#options = { siteID, token }
	}

	#generateId = () => Math.random().toString(36).slice(2, 10)

	addPendingMention = async (mention) => {
		const store = getStore({ name: 'queue', ...this.#options })
		const id = this.#generateId()
		await store.setJSON(id, mention)
		return {
			_id: id,
			...mention,
			processed: false
		}
	}

	getNextPendingMentions = async () => {
		const store = getStore({ name: 'queue', ...this.#options })
		const { blobs } = await store.list()
		const mentions = []
		for (const { key } of blobs) {
			const value = await store.get(key, { type: 'json' })
			mentions.push({
				_id: key,
				...value
			})
			await store.delete(key)
		}
		return mentions
	}

	deleteMention = async (mention) => {
		const store = getStore({ name: 'target', ...this.#options })
		const key = encodeURIComponent(mention.target)
		const target = await store.get(key, { type: 'json' })
		if (!target) return
		const mentions = target.filter(m => m.source !== mention.source)
		if (!mentions) {
			console.log(`[INFO] Delete ${mention.target} from 'target'`)
			await store.delete(key)
		} else {
			console.log(`[INFO] Update ${mention.target} in 'target'`)
			await store.setJSON(key, mentions)
		}
	}

	getMentionsForPage = async (page, type) => {
		const store = getStore({ name: 'target', ...this.#options })
		const mentions = await store.get(encodeURIComponent(page), { type: 'json' })
		if (!type) return mentions
		return mentions.filter(m => type === m.type)
	}

	storeMentionForPage = async (page, mention) => {
		await this.storeMentionsForPage(page, [mention])
		return mention
	}

	storeMentionsForPage = async (page, mentions) => {
		const store = getStore({ name: 'target', ...this.#options })
		const key = encodeURIComponent(page)
		let target = await store.get(key, { type: 'json' }) || []
		for (const mention of mentions) {
			target = target.filter(m => m.source !== mention.source)
		}
		await store.setJSON(key, [ ...target, ...mentions ])
		return mentions
	}

	getAllMentions = async () => {
		const store = getStore({ name: 'target', ...this.#options })
		const { blobs } = await store.list()
		const mentions = {}
		for (const { key } of blobs) {
			const value = await store.get(key, { type: 'json' })
			mentions[key] = value
		}
		return mentions
	}

	clearAll = async () => {
		let total = 0
		const { stores } = await listStores(this.#options)
		for (const name of stores) {
			const store = getStore({ name, ...this.#options })
			const { blobs } = await store.list()
			console.log(`[INFO] Removing ${blobs.length} from ${name}`)
			for (const { key } of blobs) {
				await store.delete(key)
				total++
			}
		}
		return total
	}
}