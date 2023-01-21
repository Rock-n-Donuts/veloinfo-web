import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const auth = async (req: Request, res: Response) => {
  if (!req.body) {
    res.status(500).send('Missing Auth Data');
  }
  const userId = req.body.uuid;
  const user = { user_id: userId, token: userId }

  const u = await prisma.users.upsert({
    where: { user_id: userId },
    create: user,
    update: user
  })

  res.send(u);
}

export {
  auth
}