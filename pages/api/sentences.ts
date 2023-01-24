import { NextApiRequest as Req, NextApiResponse as Res } from 'next'
import { getSentences } from '../../controllers/sentences.controller'
import { isNumber } from '../../utils/typeguards.utils'

export default async function handler(
    req: Req,
    res: Res
) {
    switch (req.method) {
        case 'GET':
            const count = Number(req.query.count) || 20

            if (!isNumber(count)) {
                res.status(400).end('Invalid count value')
                return
            }
            
            const sentences = await getSentences(count)

            res.json(sentences)
            break
        default:
            res.setHeader('Allow', ['GET'])
            res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}

