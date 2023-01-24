import { NextApiRequest as Req, NextApiResponse as Res } from 'next'
import { translate } from '../../controllers/translate.controller'

export default async function handler(
    req: Req,
    res: Res
) {
    switch (req.method) {
        case 'POST':
            const { sentence, language } = req.body

            if (!sentence || !language || !language.from || !language.to) {
                res.status(400).json({message: 'Invalid data'})
                return
            }

            try {
                const translatedSentence: string = await translate(sentence, language)
                res.json({ translation: translatedSentence })
            }

            catch (err) {
                res.status(500).json({message: 'Error translating sentence'})
                return
            }

            break
        default:
            res.setHeader('Allow', ['POST'])
            res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}