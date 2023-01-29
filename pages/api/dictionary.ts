import { NextApiRequest as Req, NextApiResponse as Res } from 'next'
import { isArrayOf, isString } from '../../utils/typeguards.utils'
import { getDictionary } from '../../controllers/dictionary.controller'

export default async function handler(
    req: Req,
    res: Res
) {
    switch (req.method) {
        case 'POST':
            const { lemmas, lang } = req.body
            console.log(lemmas)
            if (!isArrayOf(lemmas, isString)) {
                res.status(400).end('Invalid lemma array')
                return
            }
            
            const dictionary = await getDictionary(lemmas, lang)

            res.json(dictionary)
            break
        default:
            res.setHeader('Allow', ['POST'])
            res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}