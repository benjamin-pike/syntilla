import { MongoClient, ObjectId } from 'mongodb';
import { IDictionaryEntry, ISentence, IWord } from '../types/types';

if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined in environment variables')
}
const url = process.env.MONGO_URI

export const getSentences = async (count: number, dueSentenceIds: string[]) => {
    const client = new MongoClient(url)
    await client.connect()

    const db = client.db('syntilla')
    const collection = db.collection('sentences')
    
    const objDueSentenceIds = dueSentenceIds.map((id) => new ObjectId(id))
    const dueSentences = await collection.find({ _id: { $in: objDueSentenceIds } }).toArray()
    const newSentences = await collection.aggregate([
        { $sample: { size: count } }
    ]).toArray().then(documents => documents
        .filter((document) => !objDueSentenceIds.includes(document._id))
        .slice(0, count - dueSentences.length)
    )

    const sentences = [...dueSentences, ...newSentences].sort(() => Math.random() - 0.5)

    await client.close()

    const [spanishTranslationData, englishTranslationData] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_ROOT_URL}/api/dictionary`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lang: 'es',
              lemmas: [...new Set(sentences.map(sentence => sentence['es'].map((word: IWord) => word.tokens[0].lemma)).flat())]
            }),
          }).then((res) => res.json()),
        fetch(`${process.env.NEXT_PUBLIC_ROOT_URL}/api/dictionary`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                lang: 'en',
                lemmas: [...new Set(sentences.map(sentence => sentence['en'].map((word: IWord) => word.tokens[0].lemma)).flat())]
            }),
        }).then((res) => res.json())
      ]);

    const responseData = sentences.map((sentence, i) => ({
        ...sentence,
        translations: {
            'es': sentence['es'].map((word: any) =>
                spanishTranslationData.find((translation: IDictionaryEntry) => translation.lemma === word.tokens[0].lemma) || null
            ),
            'en': sentence['en'].map((word: any) =>
                englishTranslationData.find((translation: IDictionaryEntry) => translation.lemma === word.tokens[0].lemma) || null
            )
        }
    }))

    return responseData
}