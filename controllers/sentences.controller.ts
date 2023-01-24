import { MongoClient } from 'mongodb';

if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined in environment variables')
}

const url = process.env.MONGO_URI

export const getSentences = async (count: number) => {
    const client = new MongoClient(url)
    await client.connect()

    const db = client.db('syntilla')
    const collection = db.collection('sentences')

    const sentences = await collection.aggregate([
        { $sample: { size: count } }
    ]).toArray()

    const [spanishTranslationData, englishTranslationData] = await Promise.all([
        Promise.all(sentences.map(async (sentence) => {
          const res = await fetch('http://localhost:3000/api/dictionary', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lang: 'es',
              lemmas: sentence['es'].map((word: any) => word.tokens[0].lemma),
            }),
          });
          const data = await res.json();
          return data;
        })),
        Promise.all(sentences.map(async (sentence) => {
          const res = await fetch('http://localhost:3000/api/dictionary', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lang: 'en',
              lemmas: sentence['en'].map((word: any) => word.tokens[0].lemma),
            }),
          });
          const data = await res.json();
          return data;
        }))
      ]);

    const responseData = sentences.map((sentence, i) => ({
        ...sentence,
        translations: {
            'es': sentence['es'].map((word: any) =>
                spanishTranslationData[i].find((translation: any) => translation.lemma === word.tokens[0].lemma) || null
            ),
            'en': sentence['en'].map((word: any) =>
                englishTranslationData[i].find((translation: any) => translation.lemma === word.tokens[0].lemma) || null
            )
        }
    }))

    client.close()

    return responseData
}