import type { Request, Response } from 'express';

export async function qrCode(req: Request, res: Response): Promise<void> {
  const shortCode = req.params.shortCode;
  if (!shortCode) {
    res.status(404).json({ error: 'Short URL not found' });
    return;
  }

  const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shortUrl)}`;

  res.redirect(qrUrl);
}
