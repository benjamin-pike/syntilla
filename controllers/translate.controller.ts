import * as AWS from 'aws-sdk';

if (!process.env.AWS_ACCESS_KEY) {
    throw new Error('AWS_ACCESS_KEY must be defined in environment variables')
}

if (!process.env.AWS_SECRET_KEY) {
    throw new Error('AWS_SECRET_KEY must be defined in environment variables')
}

if (!process.env.AWS_REGION) {
    throw new Error('AWS_REGION must be defined in environment variables')
}

const translator = new AWS.Translate({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
  });

export const translate = async (sentence: string, language: { from: string, to: string }) => {
    const params = {
        Text: sentence,
        SourceLanguageCode: language.from,
        TargetLanguageCode: language.to
    }

    const data = await translator.translateText(params).promise()
    return data.TranslatedText
}