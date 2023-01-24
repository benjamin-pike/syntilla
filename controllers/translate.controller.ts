import * as AWS from 'aws-sdk';

if (!process.env.AWS_ACCESS) {
    throw new Error('AWS_ACCESS must be defined in environment variables')
}

if (!process.env.AWS_SECRET) {
    throw new Error('AWS_SECRET must be defined in environment variables')
}

if (!process.env.AWS_REG) {
    throw new Error('AWS_REG must be defined in environment variables')
}

const translator = new AWS.Translate({
    accessKeyId: process.env.AWS_ACCESS,
    secretAccessKey: process.env.AWS_SECRET,
    region: process.env.AWS_REG
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