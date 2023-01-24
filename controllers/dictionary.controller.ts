import { MongoClient } from 'mongodb';

if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined in environment variables')
}

const url = process.env.MONGO_URI

export const getDictionary = async (lemmas: string[], lang: 'es' | 'en') => {
    const client = new MongoClient(url)
    await client.connect()

    const db = client.db('syntilla')
    const collection = db.collection(`dict_${lang}`)

    const sentences = await collection.find({'lemma': {'$in': lemmas}}).toArray()
    
    client.close()

    return sentences
}